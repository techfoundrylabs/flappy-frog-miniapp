"use client";

import {
  decreaseHearts,
  getTimeToAutoRefill,
  initGame,
  setScoreInLeaderboard,
} from "@/actions";
import { EventBus } from "@/lib/event-bus";

import { useLayoutEffect, useRef } from "react";
import { useEventHandler } from "@/hooks/use-event-handler";
import { formatTime } from "@/utils";

interface FlappyFrogProps {
  fid: number;
  displayName: string;
  avatar: string;
}

export function FlappyFrog({ fid, displayName, avatar }: FlappyFrogProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  useEventHandler();
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
          private pipeSpeed: number = 230;
          private pipeSpacing: number = 350;
          private heartText: Phaser.GameObjects.BitmapText | null = null;
          private hearts: number = -1;
          private nextPipeX: number = 0;
          private personalRecord: Phaser.Physics.Arcade.Sprite | null = null;
          private shareButton: Phaser.GameObjects.Rectangle | null = null;
          private shareButtonText: Phaser.GameObjects.BitmapText | null = null;
          private timeToAutoRefill: number = 0;

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
            //this.load.image("title", "assets/misc/title.png");
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

            this.hearts = await this.fetchAvailableHearts();

            // Hearts.
            const heart = this.add.image(30, 35, "heartFull");
            heart.setDepth(99);
            this.heartText = this.add
              .bitmapText(65, 35, "letters", `${this.hearts}`, 16)
              .setOrigin(0.5)
              .setTint(0xffffff);
            this.heartText.setDepth(99);

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
              0x2472a8,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(4, 0xffffff);

            // Game title.
            /*             const titleText = this.add
              .sprite(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 160,
                "title",
              )
              .setOrigin(0.5); */

            // "Tap to play" instruction text.
            const tapText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 35,
                "letters",
                `${this.hearts >= 0 ? "TAP TO PLAY" : "LOADING"}`,
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
                EventBus.emit("play-game");
                overlay.destroy();
                modalBg.destroy();
                //titleText.destroy();
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
              //titleText,
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

              // Let the frog fall down with gravity. When it hits the
              // ground, show the game over UI.
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

            if (this.heartText) {
              this.heartText.setText(this.hearts.toString());
            }

            // Put the user score in the leaderboard.
            const leaderBoardResult = await setScoreInLeaderboard(
              fid,
              displayName,
              avatar,
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
              0x2472a8,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(4, 0xffffff);

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

            this.shareButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 20,
              150,
              40,
              0x3e84d5,
            );
            this.shareButton.setOrigin(0.5);
            this.shareButton.setInteractive({ useHandCursor: true });
            this.shareButtonText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 20,
                "letters",
                "SHARE",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);
            // Share event.
            this.shareButton.on("pointerdown", async () => {
              EventBus.emit("share", this.score);
            });
            this.shareButton.on("pointerover", () => {
              this.shareButton?.setFillStyle(0x6b96c7);
            });
            this.shareButton.on("pointerout", () => {
              this.shareButton?.setFillStyle(0x3e84d5);
            });

            // Restart event.
            retryButton.on("pointerdown", () => {
              EventBus.emit("play-game");
              modalBg.destroy();
              retryButton.destroy();
              retryButtonText.destroy();
              this.shareButton?.destroy();
              this.shareButtonText?.destroy();
              gameOverText.destroy();
              scoreText.destroy();
              this.personalRecord?.destroy();

              if (this.hearts == 0) {
                EventBus.emit("game-over");
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

            EventBus.emit("game-over");
          }

          async showPayForTryUI() {
            // Create modal.
            this.timeToAutoRefill = (await getTimeToAutoRefill(fid)) ?? 0;
            const modalBg = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5,
              300,
              250,
              0x2472a8,
            );
            modalBg.setOrigin(0.5);
            modalBg.setStrokeStyle(4, 0xffffff);
            modalBg.setDepth(101);

            // Out of tries text.
            const messageText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 75,
                "letters",
                `OUT OF HEARTS`,
                14,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            // Explanation.
            const explanationText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 45,
                "letters",
                `AUTOREFILL IN:${formatTime(this.timeToAutoRefill)}`,
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            const explanationTextMore = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 25,
                "letters",
                "WANNA PLAY NOW?",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            // Payment button.
            const payButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 20,
              180,
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
                "BUY HEARTS",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff)
              .setDepth(101);

            // Cancel button.
            const cancelButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 70,
              180,
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

              EventBus.emit("go-to-shop");
            });

            cancelButton.on("pointerdown", () => {
              // If start overlay exists, destroy it.
              EventBus.emit("game-over");
              this.startOverlay?.destroy();

              // Remove the pay UI.
              modalBg.destroy();
              messageText.destroy();
              explanationText.destroy();
              explanationTextMore.destroy();
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
          scene: [FlappyFrogScene],
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
