"use client";

import {
  decreaseHearts,
  initGame,
  resetGame,
  setScoreInLeaderboard,
  getTopPlayers,
} from "@/actions";
import { MAX_HEARTS } from "@/config/constants";
import { EventBus } from "@/lib/event-bus";

import { useLayoutEffect, useRef } from "react";
import { TransactionReceipt } from "viem";

const HEARTS = MAX_HEARTS ?? 3;

interface FlappyFrogProps {
  fid: number;
  displayName: string;
  address: `0x${string}`;
  formattedBalance: string;
  treasuryValue: string;
  pay: () => Promise<TransactionReceipt | undefined>;
}

export function FlappyFrog({
  fid,
  displayName,
  address,
  formattedBalance,
  //treasuryValue,
  pay,
}: FlappyFrogProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    const initPhaser = async () => {
      if (typeof window !== "undefined" && gameContainerRef.current) {
        const Phaser = (await import("phaser")).default;

        class FlappyFrogScene extends Phaser.Scene {
          private frog: Phaser.Physics.Arcade.Sprite | null = null;
          private pipes: Phaser.Physics.Arcade.Group | null = null;
          private score: number = 0;
          private scoreText: Phaser.GameObjects.BitmapText | null = null;
          private gameOver: boolean = false;
          private gameStarted: boolean = false;
          private startOverlay: Phaser.GameObjects.Container | null = null;
          private pipeSpeed: number = 200;
          private pipeSpacing: number = 350;
          private hearts: number = 0;
          private nextPipeX: number = 0;
          private personalRecord: Phaser.Physics.Arcade.Sprite | null = null;

          constructor() {
            super({ key: "FlappyFrogScene" });
          }

          init() {
            this.score = 0;
            this.gameOver = false;
            this.gameStarted = false;
            this.pipeSpeed = 200;
            this.pipeSpacing = 350;
            this.hearts = 0;
            this.nextPipeX = 0;

            if (this.anims) {
              this.anims.resumeAll();
            }

            this.frog = null;
            this.pipes = null;
            this.scoreText = null;
            this.startOverlay = null;
          }

          preload() {
            // Load fonts.
            this.load.bitmapFont(
              "letters",
              "assets/fonts/letters/letters.png",
              "assets/fonts/letters/letters.xml",
            );
            this.load.bitmapFont(
              "numbers",
              "assets/fonts/numbers/numbers.png",
              "assets/fonts/numbers/numbers.xml",
            );

            // Load images and spritesheets.
            this.load.spritesheet(
              "frogSpriteSheet",
              "assets/player/frog-hat-flap-tilemap.png",
              {
                frameWidth: 88,
                frameHeight: 68,
              },
            );
            this.load.spritesheet(
              "recordSpriteSheet",
              "assets/misc/record-tilemap.png",
              {
                frameWidth: 17,
                frameHeight: 9,
              },
            );
            this.load.spritesheet(
              "loadingSpriteSheet",
              "assets/misc/loading-tilemap.png",
              {
                frameWidth: 6,
                frameHeight: 6,
              },
            );
            this.load.image("title", "assets/misc/title.png");
            this.load.image("heartFull", "assets/hearts/heart-full.png");
            this.load.image("heartEmpty", "assets/hearts/heart-empty.png");
            this.load.image("tubeTop", "assets/tubes/tube-top.png");
            this.load.image("tubeBase", "assets/tubes/tube-base.png");
            this.load.image("background", "assets/background/background.png");
          }

          async create() {
            // Set debug mode.
            // this.physics.world.createDebugGraphic();

            this.nextPipeX = this.game.config.width as number;

            // Background.
            this.add
              .image(0, 0, "background")
              .setOrigin(0, 0)
              .setDisplaySize(
                this.game.config.width as number,
                this.game.config.height as number,
              );

            // frog flapping animation.
            this.anims.create({
              key: "fly",
              frames: this.anims.generateFrameNumbers("frogSpriteSheet", {
                start: 0,
                end: 2,
              }),
              frameRate: 9,
              repeat: -1,
            });

            // Frog.
            this.frog = this.physics.add.sprite(
              100,
              (this.game.config.height as number) * 0.5,
              "frogSpriteSheet",
            );
            this.frog.setScale(0.75);
            this.frog.setDepth(99);
            this.frog.play("fly");

            // Physics Group objects.
            this.pipes = this.physics.add.group();

            // Score.
            this.scoreText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5 - 10,
                20,
                "numbers",
                "0",
                24,
              )
              .setLetterSpacing(-9)
              .setDepth(99)
              .setVisible(false);

            // Create start overlay.
            this.createStartOverlay();

            // Input handling.
            this.input.on("pointerdown", this.handlePointerDown, this);
            this.input.keyboard?.on(
              "keydown-SPACE",
              this.handlePointerDown,
              this,
            );

            // Add collision detection.
            this.physics.add.collider(
              this.frog,
              this.pipes,
              this.gameOverHandler,
              undefined,
              this,
            );

            // Fetch available hearts.
            this.hearts = (await this.fetchAvailableHearts()) ?? HEARTS;
            // Hearts.
            for (let i = 1; i < HEARTS + 1; i++) {
              const heart = this.add.image(
                i * 30,
                35,
                i <= this.hearts ? "heartFull" : "heartEmpty",
              );
              heart.setDepth(99);
            }

            if (this.hearts === 0) {
              this.showPayForTryUI();
            }
          }

          update() {
            if (this.gameOver || !this.frog) return;

            if (!this.gameStarted) {
              // If game hasn't started, make the frog float up and down.
              this.frog.y += Math.sin(this.time.now / 500) * 0.5;
              return;
            }

            // Rotate frog based on velocity.
            if (this.frog.body!.velocity.y > 0) {
              this.frog.angle = Phaser.Math.Clamp(
                this.frog.angle + 2.5,
                -10,
                40,
              );
            } else {
              this.frog.angle = Phaser.Math.Clamp(
                this.frog.angle - 4.0,
                -10,
                40,
              );
            }

            // Game over if frog goes out of bounds.
            if (
              this.frog.y > (this.game.config.height as number) ||
              this.frog.y < 0
            ) {
              this.gameOverHandler();
            }
          }

          createStartOverlay() {
            if (!this.frog) return;

            if (this.startOverlay) {
              this.startOverlay.destroy();
              this.startOverlay = null;
            }

            // Create a container for start modal elements.
            this.startOverlay = this.add.container(0, 0);

            // Semi-transparent black overlay.
            const overlay = this.add.rectangle(
              0,
              0,
              this.game.config.width as number,
              this.game.config.height as number,
              0x000000,
              0.75,
            );
            overlay.setOrigin(0, 0);

            // Modal window.
            const modalBg = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5,
              280,
              200,
              0xcaaa77,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(4, 0x7f563b);

            // Game title.
            const titleText = this.add
              .sprite(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 160,
                "title",
              )
              .setOrigin(0.5);

            // "Tap to play" instruction text.
            const tapText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 35,
                "letters",
                "TAP TO PLAY",
                14,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Start button.
            const startButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 30,
              180,
              50,
              0x4a752c,
            );
            startButton.setOrigin(0.5);
            startButton.setInteractive({ useHandCursor: true });

            // Start button text
            const startButtonText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 30,
                "letters",
                "START",
                14,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Button hover effects
            startButton.on("pointerover", () => {
              startButton.setFillStyle(0x5d9639);
            });
            startButton.on("pointerout", () => {
              startButton.setFillStyle(0x4a752c);
            });

            // Button click to start game.
            startButton.on("pointerdown", () => {
              if (this.hearts > 0) {
                overlay.destroy();
                modalBg.destroy();
                titleText.destroy();
                tapText.destroy();
                startButton.destroy();
                startButtonText.destroy();

                if (this.startOverlay) {
                  this.startOverlay.destroy();
                  this.startOverlay = null;
                }

                this.gameStarted = true;
                this.scoreText?.setVisible(true);

                // Add gravity to frog after game starts.
                this.frog?.setGravityY(1500);

                if (this.frog) {
                  this.frog.play("fly", true);
                  this.frog.setVelocityY(-400);
                }

                // Add first pipes immediately after starting.
                this.addPipes();

                // Setup pipe distance check.
                this.time.addEvent({
                  delay: 100,
                  callback: this.checkPipeDistance,
                  callbackScope: this,
                  loop: true,
                });
              } else {
                this.showPayForTryUI();
              }
            });

            // Add elements to container.
            this.startOverlay.add([
              overlay,
              modalBg,
              titleText,
              tapText,
              startButton,
              startButtonText,
            ]);

            // Set the overlay to be on top.
            this.startOverlay.setDepth(100);
          }

          handlePointerDown() {
            if (this.gameOver) return;

            if (this.gameStarted) {
              this.jump();
            }
          }

          jump() {
            if (this.gameOver || !this.frog || !this.gameStarted) return;
            this.frog.setVelocityY(-480);
          }

          checkPipeDistance() {
            if (this.gameOver || !this.frog) return;

            // Get rightmost pipe.
            let rightmostX = 0;
            if (this.pipes && this.pipes.getChildren().length > 0) {
              this.pipes
                .getChildren()
                .forEach((pipe: Phaser.GameObjects.GameObject) => {
                  const xPosition = (pipe as Phaser.Physics.Arcade.Sprite).x;
                  if (xPosition > rightmostX) {
                    rightmostX = xPosition;
                  }
                });
            }

            // If the rightmost pipe has moved left enough, add a new pipe.
            if (
              rightmostX <=
              (this.game.config.width as number) - this.pipeSpacing
            ) {
              this.addPipes();
            }
          }

          addPipes() {
            if (this.gameOver || !this.frog || !this.pipes || !this.gameStarted)
              return;

            const yGap = 100;
            const height = this.game.config.height as number;
            const pipeTop = Phaser.Math.Between(150, height - yGap - 150);
            const pipeX = this.game.config.width as number;

            // Update next pipe position for tracking.
            this.nextPipeX = pipeX;

            // Top pipe.
            const topPipe = this.pipes.create(pipeX, pipeTop - 100, "tubeTop");
            topPipe.body.allowGravity = false;
            topPipe.setVelocityX(-this.pipeSpeed);
            topPipe.setImmovable(true);
            for (let y = pipeTop - 100 - 31; y > -32; y -= 32) {
              const topPipeBase = this.pipes.create(pipeX, y, "tubeBase");
              topPipeBase.body.allowGravity = false;
              topPipeBase.setVelocityX(-this.pipeSpeed);
              topPipeBase.setImmovable(true);
            }

            // Bottom pipe.
            const bottomPipe = this.pipes.create(
              pipeX,
              pipeTop + yGap,
              "tubeTop",
            );
            bottomPipe.body.allowGravity = false;
            bottomPipe.setVelocityX(-this.pipeSpeed);
            bottomPipe.setImmovable(true);
            for (
              let y = pipeTop + yGap + 31;
              y < (this.game.config.height as number) + 32;
              y += 32
            ) {
              const bottomPipeBase = this.pipes.create(pipeX, y, "tubeBase");
              bottomPipeBase.body.allowGravity = false;
              bottomPipeBase.setVelocityX(-this.pipeSpeed);
              bottomPipeBase.setImmovable(true);
            }

            // Score zone.
            const scoreZone = this.physics.add.sprite(
              pipeX + 64,
              pipeTop + (yGap - 100) * 0.5,
              "tubeTop",
            );
            scoreZone.setScale(1, 8);
            scoreZone.body.allowGravity = false;
            scoreZone.setVelocityX(-this.pipeSpeed);
            scoreZone.setImmovable(true);
            scoreZone.setAlpha(0);

            // Increment score when passing through the score zone.
            this.physics.add.overlap(
              this.frog,
              scoreZone,
              () => {
                if (this.gameOver) return;
                this.score += 1;

                if (this.scoreText) {
                  this.scoreText.setText(`${this.score}`);
                }

                // Increase pipe speed as score increases.
                this.pipeSpeed = Math.min(350, 200 + this.score * 5);

                scoreZone.destroy();
              },
              undefined,
              this,
            );
          }

          async fetchAvailableHearts() {
            return await initGame(fid);
          }

          async gameOverHandler() {
            if (!this.gameStarted || this.gameOver) return;

            this.gameOver = true;

            if (this.frog && this.pipes) {
              this.anims.pauseAll();

              // Disable all collisions
              this.physics.world.colliders.destroy();

              // Pause the pipes and score zones.
              this.pipes
                ?.getChildren()
                .forEach((pipe: Phaser.GameObjects.GameObject) => {
                  (pipe as Phaser.Physics.Arcade.Sprite).setVelocityX(0);
                });

              // Find and stop all score zones.
              this.children.each((child: Phaser.GameObjects.GameObject) => {
                if (child instanceof Phaser.Physics.Arcade.Sprite) {
                  const sprite = child as Phaser.Physics.Arcade.Sprite;
                  if (
                    sprite.texture &&
                    sprite.texture.key === "tubeTop" &&
                    sprite.alpha === 0
                  ) {
                    sprite.setVelocityX(0);
                  }
                }
              });

              // Let the frog fall down with gravity. When it hits the ground,
              // show the game over UI.
              const gameOverTimer = this.time.addEvent({
                delay: 250,
                callback: () => {
                  if (
                    this.frog &&
                    this.frog.y > (this.game.config.height as number) + 50
                  ) {
                    this.showGameOverUI();
                    gameOverTimer.destroy();
                  }
                },
                callbackScope: this,
                repeat: -1,
              });
            }

            // Update hearts.
            this.hearts = this.hearts - 1 > 0 ? this.hearts - 1 : 0;
            await decreaseHearts(fid, this.hearts);
            for (let i = 1; i < HEARTS + 1; i++) {
              const heart = this.add.image(
                i * 30,
                35,
                i <= this.hearts ? "heartFull" : "heartEmpty",
              );
              heart.setDepth(99);
            }

            // Put the user score in the leaderboard.
            const leaderBoardResult = await setScoreInLeaderboard(
              fid,
              displayName,
              this.score,
            );
            if (leaderBoardResult?.personalRecord === true && this.score > 0) {
              this.anims.resumeAll();

              this.time.delayedCall(
                500,
                () => {
                  this.anims.create({
                    key: "record",
                    frames: this.anims.generateFrameNumbers(
                      "recordSpriteSheet",
                      {
                        start: 0,
                        end: 1,
                      },
                    ),
                    frameRate: 2,
                    repeat: -1,
                  });

                  // Personal record.
                  this.personalRecord = this.physics.add.sprite(
                    (this.game.config.width as number) * 0.5,
                    (this.game.config.height as number) * 0.5 - 125,
                    "recordSpriteSheet",
                  );
                  this.personalRecord.setScale(3);
                  this.personalRecord.setDepth(99);
                  this.personalRecord.play("record");
                },
                [],
                this,
              );
            }
          }

          showGameOverUI() {
            if (!this.frog) return;

            // Now pause physics completely.
            this.physics.pause();

            // Create modal background.
            const modalBg = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5,
              300,
              250,
              0xcaaa77,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(4, 0x7f563b);

            // Game over text.
            const gameOverText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 75,
                "letters",
                "GAME OVER",
                20,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Score.
            const scoreText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 35,
                "letters",
                `SCORE: ${this.score}`,
                14,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Add retry button.
            const retryButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 70,
              150,
              40,
              0x4a752c,
            );
            retryButton.setOrigin(0.5);
            retryButton.setInteractive({ useHandCursor: true });
            const retryButtonText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 70,
                "letters",
                "RETRY",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Add share button.
            const shareButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 20,
              150,
              40,
              0x3e84d5,
            );
            shareButton.setOrigin(0.5);
            shareButton.setInteractive({ useHandCursor: true });
            const shareButtonText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 20,
                "letters",
                "SHARE",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Restart event.
            retryButton.on("pointerdown", () => {
              modalBg.destroy();
              retryButton.destroy();
              retryButtonText.destroy();
              shareButton.destroy();
              shareButtonText.destroy();
              gameOverText.destroy();
              scoreText.destroy();
              this.personalRecord?.destroy();

              if (this.hearts == 0) {
                this.showPayForTryUI();
              } else {
                // Destroy all physics objects including pipes and score zones.
                this.physics.world.colliders.destroy();

                // Destroy all game objects in the pipes group.
                this.pipes?.clear(true, true);

                // Find and destroy any remaining score zones.
                this.children.each((child: Phaser.GameObjects.GameObject) => {
                  if (child instanceof Phaser.Physics.Arcade.Sprite) {
                    const sprite = child as Phaser.Physics.Arcade.Sprite;
                    if (
                      sprite.texture &&
                      sprite !== this.frog &&
                      sprite.texture.key === "tubeTop" &&
                      sprite.alpha === 0
                    ) {
                      child.destroy();
                    }
                  }
                });

                // Reset frog.
                this.frog?.setPosition(
                  100,
                  (this.game.config.height as number) * 0.5,
                );
                this.frog?.setVelocity(0, 0);
                this.frog?.setGravityY(0);
                this.frog?.setAngle(0);
                this.frog?.clearTint();

                // Reset game state.
                this.score = 0;
                this.gameOver = false;
                this.pipeSpeed = 200;
                this.nextPipeX = 0;

                // Re-add collision detection.
                if (this.frog && this.pipes) {
                  this.physics.add.collider(
                    this.frog,
                    this.pipes,
                    this.gameOverHandler,
                    undefined,
                    this,
                  );
                }

                if (this.scoreText) {
                  this.scoreText.setText("0");
                  this.scoreText.setVisible(true);
                }

                this.gameStarted = true;

                // Apply gravity and make the frog jump to start.
                if (this.frog) {
                  this.frog.setGravityY(1500);
                  this.frog.play("fly", true);
                  this.frog.setVelocityY(-400);
                }

                // Add first pipes immediately after starting.
                this.addPipes();

                // Setup pipe distance check.
                this.time.addEvent({
                  delay: 100,
                  callback: this.checkPipeDistance,
                  callbackScope: this,
                  loop: true,
                });

                // Resume animations and physics.
                this.anims.resumeAll();
                this.physics.resume();
              }
            });
            retryButton.on("pointerover", () => {
              retryButton.setFillStyle(0x5d9639);
            });
            retryButton.on("pointerout", () => {
              retryButton.setFillStyle(0x4a752c);
            });

            // Share event.
            shareButton.on("pointerdown", async () => {
              EventBus.emit("share", this.score);
            });
            shareButton.on("pointerover", () => {
              shareButton.setFillStyle(0x6b96c7);
            });
            shareButton.on("pointerout", () => {
              shareButton.setFillStyle(0x3e84d5);
            });
          }

          async showPayForTryUI() {
            // Create modal.
            const modalBg = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5,
              300,
              250,
              0xcaaa77,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(4, 0x7f563b);
            modalBg.setDepth(101);

            // Out of tries text.
            const messageText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 75,
                "letters",
                "OUT OF HEARTS",
                14,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            // Explanation.
            const explanationText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 35,
                "letters",
                "WANNA REFILL?",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            // Payment button.
            const payButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 20,
              150,
              40,
              0x4a752c,
            );
            payButton.setOrigin(0.5);
            payButton.setInteractive({ useHandCursor: true });
            payButton.setDepth(101);
            const payButtonText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 20,
                "letters",
                "PAY",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            // Cancel button.
            const cancelButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 70,
              150,
              40,
              0xd53e3e,
            );
            cancelButton.setOrigin(0.5);
            cancelButton.setInteractive({ useHandCursor: true });
            cancelButton.setDepth(101);
            const cancelButtonText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 70,
                "letters",
                "CANCEL",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            // Payment event.
            payButton.on("pointerdown", async () => {
              payButtonText.setVisible(false);

              this.anims.create({
                key: "loading",
                frames: this.anims.generateFrameNumbers("loadingSpriteSheet", {
                  start: 0,
                  end: 7,
                }),
                frameRate: 4,
                repeat: -1,
              });

              // Loading animation.
              const loadingIcon = this.physics.add.sprite(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 20,
                "loadingSpriteSheet",
              );
              loadingIcon.setScale(3);
              loadingIcon.setDepth(101);
              loadingIcon.play("loading");

              // Payment process.
              const paymentResult = await pay();
              if (paymentResult) {
                loadingIcon.destroy();
                await resetGame(fid);
              } else {
                loadingIcon.destroy();
                payButtonText.setVisible(true);
              }
            });
            payButton.on("pointerover", () => {
              payButton.setFillStyle(0x5d9639);
            });
            payButton.on("pointerout", () => {
              payButton.setFillStyle(0x4a752c);
            });

            // Payment cancellation event.
            cancelButton.on("pointerdown", () => {
              // If start overlay exists, destroy it.
              this.startOverlay?.destroy();

              // Remove the pay UI.
              modalBg.destroy();
              messageText.destroy();
              explanationText.destroy();
              payButton.destroy();
              payButtonText.destroy();
              cancelButton.destroy();
              cancelButtonText.destroy();

              // Destroy all physics objects including pipes and score zones.
              if (this.physics) {
                this.physics.world.colliders.destroy();
              }

              // Destroy all game objects in the pipes group.
              this.pipes?.clear(true, true);

              // Find and destroy any remaining score zones.
              this.children.each((child: Phaser.GameObjects.GameObject) => {
                if (child instanceof Phaser.Physics.Arcade.Sprite) {
                  const sprite = child as Phaser.Physics.Arcade.Sprite;
                  if (
                    sprite.texture &&
                    sprite !== this.frog &&
                    sprite.texture.key === "tubeTop" &&
                    sprite.alpha === 0
                  ) {
                    child.destroy();
                  }
                }
              });

              // Reset frog.
              this.frog?.setPosition(
                100,
                (this.game.config.height as number) * 0.5,
              );
              this.frog?.setVelocity(0, 0);
              this.frog?.setGravityY(0);
              this.frog?.setAngle(0);
              this.frog?.clearTint();

              // Reset game state.
              this.score = 0;
              this.gameOver = false;
              this.gameStarted = false;
              this.pipeSpeed = 200;
              this.nextPipeX = 0;

              // Re-add collision detection.
              if (this.frog && this.pipes) {
                this.physics.add.collider(
                  this.frog,
                  this.pipes,
                  this.gameOverHandler,
                  undefined,
                  this,
                );
              }

              if (this.scoreText) {
                this.scoreText.setText("0");
                this.scoreText.setVisible(false);
              }

              // Create a new start overlay.
              this.createStartOverlay();

              // Resume animations and physics.
              this.anims.resumeAll();
              this.physics.resume();
            });
            cancelButton.on("pointerover", () => {
              cancelButton.setFillStyle(0xde5a5a);
            });
            cancelButton.on("pointerout", () => {
              cancelButton.setFillStyle(0xd53e3e);
            });
          }
        }

        class RankingScene extends Phaser.Scene {
          constructor() {
            super({ key: "RankingScene" });
          }

          preload() {
            // Load fonts.
            this.load.bitmapFont(
              "letters",
              "assets/fonts/letters/letters.png",
              "assets/fonts/letters/letters.xml",
            );
            this.load.bitmapFont(
              "numbers",
              "assets/fonts/numbers/numbers.png",
              "assets/fonts/numbers/numbers.xml",
            );
          }

          async create() {
            const modalWidth = this.game.config.width as number;
            const modalHeight = (this.game.config.height as number) - 40;

            const modalBg = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 - 42,
              modalWidth,
              modalHeight,
              0xcaaa77,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(2, 0x7f563b);

            // Leaderboard data.
            const leaderboardData = (await this.getLeaderboardData()) as Record<
              string,
              string
            >[];

            const rowHeight = modalHeight / 11;
            const tableLeft =
              (this.game.config.width as number) * 0.5 - modalWidth * 0.5 + 20;
            const tableWidth = modalWidth - 2;
            const playerColPos = tableLeft + tableWidth * 0.2;
            const scoreColPos = tableLeft + tableWidth * 0.725;

            const headerBg = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              rowHeight * 0.5 - 2,
              tableWidth,
              rowHeight,
              0x7f563b,
            );
            headerBg.setOrigin(0.5, 0.5);
            // Rank header text.
            this.add
              .bitmapText(tableLeft, rowHeight * 0.5, "letters", "#", 12)
              .setOrigin(0, 0.5)
              .setTint(0xf8d86c);
            // Player header text.
            this.add
              .bitmapText(
                playerColPos,
                rowHeight * 0.5,
                "letters",
                "PLAYER",
                12,
              )
              .setOrigin(0, 0.5)
              .setTint(0xf8d86c);
            // Score header text.
            this.add
              .bitmapText(scoreColPos, rowHeight * 0.5, "letters", "SCORE", 12)
              .setOrigin(0, 0.5)
              .setTint(0xf8d86c);

            for (let i = 0; i < leaderboardData.length; i++) {
              const entry = leaderboardData[i];

              // Rank tint color.
              let rankTint = 0xffffff;
              if (i === 0) rankTint = 0xffd700;
              else if (i === 1) rankTint = 0xc0c0c0;
              else if (i === 2) rankTint = 0xcd7f32;

              // Player - Score tint color.
              const textTint = 0xffffff;

              const rowY = rowHeight * 0.5 - 2 + (i + 1) * rowHeight;

              const maxNameLength = 10;
              const formattedName =
                entry.name.length > maxNameLength
                  ? entry.name.substring(0, maxNameLength) + "..."
                  : entry.name;

              const rowBg = this.add.rectangle(
                (this.game.config.width as number) * 0.5,
                rowY,
                tableWidth,
                rowHeight,
                i % 2 === 0 ? 0xb69865 : 0xa88c5a,
              );
              rowBg.setOrigin(0.5, 0.5);
              // Rank text.
              this.add
                .bitmapText(
                  tableLeft,
                  rowY,
                  "letters",
                  `${(i + 1).toString().padEnd(2, " ")}`,
                  10,
                )
                .setOrigin(0, 0.5)
                .setTint(rankTint);
              // Player text.
              this.add
                .bitmapText(playerColPos, rowY, "letters", formattedName, 10)
                .setOrigin(0, 0.5)
                .setTint(textTint);
              // Score text.
              this.add
                .bitmapText(
                  scoreColPos,
                  rowY,
                  "letters",
                  entry.score.toString(),
                  10,
                )
                .setOrigin(0, 0.5)
                .setTint(textTint);
            }
          }

          async getLeaderboardData() {
            return (await getTopPlayers()) ?? [];
          }
        }

        class UserScene extends Phaser.Scene {
          constructor() {
            super({ key: "UserScene" });
          }

          preload() {
            // Load fonts.
            this.load.bitmapFont(
              "letters",
              "assets/fonts/letters/letters.png",
              "assets/fonts/letters/letters.xml",
            );
            this.load.bitmapFont(
              "numbers",
              "assets/fonts/numbers/numbers.png",
              "assets/fonts/numbers/numbers.xml",
            );
          }

          create() {
            const modalWidth = this.game.config.width as number;
            const modalHeight = (this.game.config.height as number) - 40;

            const modalBg = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 - 42,
              modalWidth,
              modalHeight,
              0xcaaa77,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(2, 0x7f563b);

            // Format address to show only first and last 5 characters.
            const formattedAddress = address
              ? `${address.substring(0, 5)}...${address.substring(address.length - 5)}`
              : "";

            // User address.
            this.add
              .bitmapText(30, 50, "letters", `Address: ${formattedAddress}`, 12)
              .setOrigin(0, 0.5)
              .setTint(0xffffff)
              .setDepth(100);

            // User balance.
            this.add
              .bitmapText(
                30,
                80,
                "letters",
                `Balance: ${parseFloat(formattedBalance).toFixed(4)} ETH`,
                12,
              )
              .setOrigin(0, 0.5)
              .setTint(0xffffff)
              .setDepth(100);
          }
        }

        type NavigationButton = {
          btn: Phaser.GameObjects.Rectangle;
          icon: Phaser.GameObjects.Sprite;
          text: Phaser.GameObjects.BitmapText;
        };

        class NavigationScene extends Phaser.Scene {
          private buttons: {
            gameButton: NavigationButton;
            rankingButton: NavigationButton;
            userButton: NavigationButton;
          } | null = null;

          private activeTab: string = "game";

          constructor() {
            super({ key: "NavigationScene" });
          }

          preload() {
            // Load font.
            this.load.bitmapFont(
              "letters",
              "assets/fonts/letters/letters.png",
              "assets/fonts/letters/letters.xml",
            );

            // Icons.
            this.load.image("gameIcon", "assets/navbar/navbar-game.png");
            this.load.image("rankingIcon", "assets/navbar/navbar-ranking.png");
            this.load.image("userIcon", "assets/navbar/navbar-user.png");
          }

          create() {
            const width = this.game.config.width as number;
            const height = this.game.config.height as number;

            const navBarBg = this.add.rectangle(
              width * 0.5,
              height - 30,
              width,
              60,
              0xcaaa77,
            );
            navBarBg.setOrigin(0.5, 0.5);
            navBarBg.setDepth(100);

            const createButton = (
              position: number,
              iconKey: string,
              label: string,
              sceneKey: string,
              tabKey: string,
            ) => {
              const isActive = this.activeTab === tabKey;

              const btnColor = isActive ? 0x7f563b : 0xcaaa77;
              const textColor = isActive ? 0xcaaa77 : 0x7f563b;

              // Button
              const btn = this.add.rectangle(
                width * position,
                height - 30,
                width * (1 / 3),
                60,
                btnColor,
              );
              btn.setOrigin(0.5, 0.5);
              btn.setStrokeStyle(2, 0x7f563b);
              btn.setInteractive({ useHandCursor: true });
              btn.setDepth(100);

              // Icon.
              const icon = this.add.sprite(
                width * position,
                height - 38,
                iconKey,
              );
              icon.setTintFill(isActive ? 0xcaaa77 : 0x7f563b);
              icon.setDepth(100);

              // Text.
              const text = this.add
                .bitmapText(width * position, height - 16, "letters", label, 8)
                .setOrigin(0.5)
                .setTint(textColor)
                .setDepth(100);

              // Hover events.
              btn.on("pointerover", () => {
                if (this.activeTab !== tabKey) {
                  btn.setFillStyle(0xb27752);
                  icon.setTintFill(0xcaaa77);
                  text.setTintFill(0xcaaa77);
                }
              });

              btn.on("pointerout", () => {
                if (this.activeTab !== tabKey) {
                  btn.setFillStyle(0xcaaa77);
                  icon.setTintFill(0x7f563b);
                  text.setTintFill(0x7f563b);
                }
              });

              // Switch scene events.
              btn.on("pointerdown", () => {
                if (this.activeTab !== tabKey) {
                  // Update active tab.
                  this.activeTab = tabKey;
                  // Switch to the target scene.
                  this.switchToScene(sceneKey);
                  // Update button states.
                  this.updateButtonStates();
                }
              });

              return { btn, icon, text };
            };

            // Buttons.
            this.buttons = {
              gameButton: createButton(
                1 / 6,
                "gameIcon",
                "GAME",
                "FlappyFrogScene",
                "game",
              ),
              rankingButton: createButton(
                3 / 6,
                "rankingIcon",
                "RANKING",
                "RankingScene",
                "ranking",
              ),
              userButton: createButton(
                5 / 6,
                "userIcon",
                "USER",
                "UserScene",
                "user",
              ),
            };

            // Make sure the initial scene is active (GameScene, by default.)
            this.scene.bringToTop();
          }

          switchToScene(sceneKey: string) {
            // Put all game scenes to sleep except the target one.
            const gameScenes = ["FlappyFrogScene", "RankingScene", "UserScene"];
            gameScenes.forEach((scene) => {
              if (scene !== sceneKey) {
                if (this.scene.isActive(scene)) {
                  this.scene.sleep(scene);
                }
              }
            });

            // Start or wake the target scene.
            if (this.scene.isSleeping(sceneKey)) {
              this.scene.wake(sceneKey);
            } else if (!this.scene.isActive(sceneKey)) {
              this.scene.launch(sceneKey);
            }

            // Ensure NavigationScene stays on top.
            this.scene.bringToTop();
          }

          updateButtonStates() {
            if (!this.buttons) return;

            const { gameButton, rankingButton, userButton } = this.buttons;

            // Reset all buttons.
            [gameButton, rankingButton, userButton].forEach((button) => {
              button.btn.setFillStyle(0xcaaa77);
              button.icon.setTintFill(0x7f563b);
              button.text.setTintFill(0x7f563b);
            });

            // Activate the correct button.
            switch (this.activeTab) {
              case "game":
                gameButton.btn.setFillStyle(0x7f563b);
                gameButton.icon.setTintFill(0xcaaa77);
                gameButton.text.setTintFill(0xcaaa77);
                break;
              case "ranking":
                rankingButton.btn.setFillStyle(0x7f563b);
                rankingButton.icon.setTintFill(0xcaaa77);
                rankingButton.text.setTintFill(0xcaaa77);
                break;
              case "user":
                userButton.btn.setFillStyle(0x7f563b);
                userButton.icon.setTintFill(0xcaaa77);
                userButton.text.setTintFill(0xcaaa77);
                break;
            }
          }
        }

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameContainerRef.current,
          width: window.innerWidth < 480 ? window.innerWidth : 480,
          height: window.innerHeight,
          pixelArt: true,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false,
            },
          },
          scene: [NavigationScene, FlappyFrogScene, RankingScene, UserScene],
        };

        // Destroy any existing game instance.
        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy(true);
        }

        // Create new game instance.
        gameInstanceRef.current = new Phaser.Game(config);

        // Start NavigationScene.
        const game = gameInstanceRef.current;
        game.scene.start("NavigationScene");
        game.scene.start("FlappyFrogScene");
      }
    };

    initPhaser();

    // Cleanup.
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div
        ref={gameContainerRef}
        className="w-full h-full overflow-hidden"
        style={{ maxHeight: "100vh" }}
      />
    </div>
  );
}
