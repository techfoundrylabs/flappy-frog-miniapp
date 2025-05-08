"use client";

import {
  decreaseHearts,
  initGame,
  setScoreInLeaderboard,
  getTopPlayers,
  shareCast,
} from "@/app/_actions";
import { useLayoutEffect, useRef } from "react";

const HEARTS = Number(process.env.NEXT_PUBLIC_MAX_HEARTS) ?? 3;

interface FlappyBirdComponentProps {
  fid: number;
  displayName: string;
}

export function FlappyBirdComponent({
  fid,
  displayName,
}: FlappyBirdComponentProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    const initPhaser = async () => {
      if (typeof window !== "undefined" && gameContainerRef.current) {
        const Phaser = (await import("phaser")).default;

        class FlappyBirdScene extends Phaser.Scene {
          private bird: Phaser.Physics.Arcade.Sprite | null = null;
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

          constructor() {
            super({ key: "FlappyBirdScene" });
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

            this.bird = null;
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
              "birdSpriteSheet",
              "assets/player/bird-flap-tilemap.png",
              {
                frameWidth: 68,
                frameHeight: 48,
              },
            );
            this.load.image("heartFull", "assets/hearts/heart-full.png");
            this.load.image("heartEmpty", "assets/hearts/heart-empty.png");
            this.load.image("tubeTop", "assets/tubes/tube-top.png");
            this.load.image("tubeBase", "assets/tubes/tube-base.png");
            this.load.image("background", "assets/background/background.png");

            // Navigation bar icons.
            this.load.image("gameIcon", "assets/navbar/navbar-game.png");
            this.load.image("rankingIcon", "assets/navbar/navbar-ranking.png");
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

            // Bird flapping animation.
            this.anims.create({
              key: "fly",
              frames: this.anims.generateFrameNumbers("birdSpriteSheet", {
                start: 0,
                end: 2,
              }),
              frameRate: 9,
              repeat: -1,
            });

            // Bird.
            this.bird = this.physics.add.sprite(
              100,
              (this.game.config.height as number) * 0.5,
              "birdSpriteSheet",
            );
            this.bird.setScale(0.75);
            this.bird.setDepth(99);
            this.bird.play("fly");

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
              this.bird,
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
                10 + i * 35,
                35,
                i <= this.hearts ? "heartFull" : "heartEmpty",
              );
              heart.setDepth(99);
            }

            if (this.hearts === 0) {
              this.showPayForTryUI();
            }

            // Navigation bar.
            this.createNavigationBar();
          }

          update() {
            if (this.gameOver || !this.bird) return;

            if (!this.gameStarted) {
              // If game hasn't started, make the bird float up and down.
              this.bird.y += Math.sin(this.time.now / 500) * 0.5;
              return;
            }

            // Rotate bird based on velocity.
            if (this.bird.body!.velocity.y > 0) {
              this.bird.angle = Phaser.Math.Clamp(
                this.bird.angle + 2.5,
                -45,
                90,
              );
            } else {
              this.bird.angle = Phaser.Math.Clamp(
                this.bird.angle - 4.0,
                -45,
                90,
              );
            }

            // Game over if bird goes out of bounds.
            if (
              this.bird.y > (this.game.config.height as number) ||
              this.bird.y < 0
            ) {
              this.gameOverHandler();
            }
          }

          createStartOverlay() {
            if (!this.bird) return;

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
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 140,
                "letters",
                "FLAPPY BIRD",
                24,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // "Tap to play" instruction text.
            const tapText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 - 35,
                "letters",
                "TAP TO PLAY",
                16,
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
                16,
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

                // Solo dopo aver rimosso tutto, avviamo il gioco
                this.gameStarted = true;
                this.scoreText?.setVisible(true);

                // Add gravity to bird after game starts.
                this.bird?.setGravityY(1500);

                if (this.bird) {
                  this.bird.play("fly", true);
                  this.bird.setVelocityY(-400);
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
            if (this.gameOver || !this.bird || !this.gameStarted) return;
            this.bird.setVelocityY(-480);
          }

          checkPipeDistance() {
            if (this.gameOver || !this.bird) return;

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
            if (this.gameOver || !this.bird || !this.pipes || !this.gameStarted)
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
              this.bird,
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

          createNavigationBar() {
            const width = this.game.config.width as number;
            const height = this.game.config.height as number;

            // Navigation bar background.
            const navBarBg = this.add.rectangle(
              width * 0.5,
              height - 30,
              width,
              60,
              0xcaaa77,
            );
            navBarBg.setOrigin(0.5, 0.5);
            navBarBg.setDepth(100);

            // Game button (active.)
            const gameBtn = this.add.rectangle(
              width * 0.25,
              height - 30,
              width * 0.5,
              60,
              0x7f563b,
            );
            gameBtn.setOrigin(0.5, 0.5);
            gameBtn.setStrokeStyle(2, 0x7f563b);
            gameBtn.setInteractive({ useHandCursor: true });
            gameBtn.setDepth(100);
            // Game icon.
            const gameIcon = this.add.sprite(
              width * 0.25,
              height - 38,
              "gameIcon",
            );
            gameIcon.setTintFill(0xcaaa77);
            gameIcon.setDepth(100);
            // Game text.
            this.add
              .bitmapText(width * 0.25, height - 16, "letters", "GAME", 8)
              .setOrigin(0.5)
              .setTint(0xcaaa77)
              .setDepth(100);

            // Ranking button.
            const rankingBtn = this.add.rectangle(
              width * 0.75,
              height - 30,
              width * 0.5,
              60,
              0xcaaa77,
            );
            rankingBtn.setOrigin(0.5, 0.5);
            rankingBtn.setStrokeStyle(2, 0x7f563b);
            rankingBtn.setInteractive({ useHandCursor: true });
            rankingBtn.setDepth(100);
            // Ranking icon.
            const rankingIcon = this.add.sprite(
              width * 0.75,
              height - 38,
              "rankingIcon",
            );
            rankingIcon.setDepth(100);
            // Ranking text.
            const rankingIconText = this.add
              .bitmapText(width * 0.75, height - 16, "letters", "RANKING", 8)
              .setOrigin(0.5)
              .setTint(0x523449)
              .setDepth(100);

            // Ranking Button events.
            rankingBtn.on("pointerdown", () => {
              this.scene.stop("RankingScene");
              this.scene.start("RankingScene");
            });
            rankingBtn.on("pointerover", () => {
              rankingBtn.setFillStyle(0x7f563b);
              rankingIcon.setTintFill(0xcaaa77);
              rankingIconText.setTintFill(0xcaaa77);
            });
            rankingBtn.on("pointerout", () => {
              rankingBtn.setFillStyle(0xcaaa77);
              rankingIcon.setTintFill(0x7f563b);
              rankingIconText.setTintFill(0x7f563b);
            });
          }

          async gameOverHandler() {
            if (!this.gameStarted || this.gameOver) return;

            this.gameOver = true;

            if (this.bird && this.pipes) {
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

              // Let the bird fall down with gravity. When it hits the ground,
              // show the game over UI.
              const gameOverTimer = this.time.addEvent({
                delay: 250,
                callback: () => {
                  if (
                    this.bird &&
                    this.bird.y > (this.game.config.height as number) + 50
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
                10 + i * 35,
                35,
                i <= this.hearts ? "heartFull" : "heartEmpty",
              );
              heart.setDepth(99);
            }

            // Put the user score in the leaderboard.
            await setScoreInLeaderboard(fid, displayName, this.score);
          }

          showGameOverUI() {
            if (!this.bird) return;

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
                16,
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
            this.add
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
            this.add
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
              shareButton.destroy();
              gameOverText.destroy();
              scoreText.destroy();

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
                      sprite !== this.bird &&
                      sprite.texture.key === "tubeTop" &&
                      sprite.alpha === 0
                    ) {
                      child.destroy();
                    }
                  }
                });

                // Reset bird.
                this.bird?.setPosition(
                  100,
                  (this.game.config.height as number) * 0.5,
                );
                this.bird?.setVelocity(0, 0);
                this.bird?.setGravityY(0);
                this.bird?.setAngle(0);
                this.bird?.clearTint();

                // Reset game state.
                this.score = 0;
                this.gameOver = false;
                this.pipeSpeed = 200;
                this.nextPipeX = 0;

                // Re-add collision detection.
                if (this.bird && this.pipes) {
                  this.physics.add.collider(
                    this.bird,
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

                // Apply gravity and make the bird jump to start.
                if (this.bird) {
                  this.bird.setGravityY(1500);
                  this.bird.play("fly", true);
                  this.bird.setVelocityY(-400);
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
              await this.shareResult();
            });
            shareButton.on("pointerover", () => {
              shareButton.setFillStyle(0x6b96c7);
            });
            shareButton.on("pointerout", () => {
              shareButton.setFillStyle(0x3e84d5);
            });
          }

          showPayForTryUI() {
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
                16,
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
            payButton.on("pointerdown", () => {
              // TODO: Implement payment logic.

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
              this.physics.world.colliders.destroy();

              // Destroy all game objects in the pipes group.
              this.pipes?.clear(true, true);

              // Find and destroy any remaining score zones.
              this.children.each((child: Phaser.GameObjects.GameObject) => {
                if (child instanceof Phaser.Physics.Arcade.Sprite) {
                  const sprite = child as Phaser.Physics.Arcade.Sprite;
                  if (
                    sprite.texture &&
                    sprite !== this.bird &&
                    sprite.texture.key === "tubeTop" &&
                    sprite.alpha === 0
                  ) {
                    child.destroy();
                  }
                }
              });

              // Reset bird.
              this.bird?.setPosition(
                100,
                (this.game.config.height as number) * 0.5,
              );
              this.bird?.setVelocity(0, 0);
              this.bird?.setGravityY(0);
              this.bird?.setAngle(0);
              this.bird?.clearTint();

              // Reset game state.
              this.score = 0;
              this.gameOver = false;
              this.gameStarted = false;
              this.pipeSpeed = 200;
              this.nextPipeX = 0;
              this.hearts = HEARTS;

              // Refill hearts.
              for (let i = 1; i < HEARTS + 1; i++) {
                const heart = this.add.image(
                  10 + i * 35,
                  35,
                  i <= this.hearts ? "heartFull" : "heartEmpty",
                );
                heart.setDepth(99);
              }

              // Re-add collision detection.
              if (this.bird && this.pipes) {
                this.physics.add.collider(
                  this.bird,
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
            payButton.on("pointerover", () => {
              payButton.setFillStyle(0x5d9639);
            });
            payButton.on("pointerout", () => {
              payButton.setFillStyle(0x4a752c);
            });

            // Payment cancellation event.
            cancelButton.on("pointerdown", () => {
              // TODO: Implement payment cancellation logic.
              return;
            });
            cancelButton.on("pointerover", () => {
              cancelButton.setFillStyle(0xde5a5a);
            });
            cancelButton.on("pointerout", () => {
              cancelButton.setFillStyle(0xd53e3e);
            });
          }

          async shareResult() {
            await shareCast();
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

            // Navigation bar icons.
            this.load.image("gameIcon", "assets/navbar/navbar-game.png");
            this.load.image("rankingIcon", "assets/navbar/navbar-ranking.png");
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

            // Navigation bar.
            this.createNavigationBar();
          }

          createNavigationBar() {
            const width = this.game.config.width as number;
            const height = this.game.config.height as number;

            // Navigation bar background.
            const navBarBg = this.add.rectangle(
              width * 0.5,
              height - 30,
              width,
              60,
              0xcaaa77,
            );
            navBarBg.setOrigin(0.5, 0.5);
            navBarBg.setDepth(100);

            // Game button.
            const gameBtn = this.add.rectangle(
              width * 0.25,
              height - 30,
              width * 0.5,
              60,
              0xcaaa77,
            );
            gameBtn.setOrigin(0.5, 0.5);
            gameBtn.setStrokeStyle(2, 0x7f563b);
            gameBtn.setInteractive({ useHandCursor: true });
            gameBtn.setDepth(100);
            // Game icon.
            const gameIcon = this.add.sprite(
              width * 0.25,
              height - 38,
              "gameIcon",
            );
            gameIcon.setTintFill(0x7f563b);
            gameIcon.setDepth(100);
            // Game text.
            const gameIconText = this.add
              .bitmapText(width * 0.25, height - 16, "letters", "GAME", 8)
              .setOrigin(0.5)
              .setTint(0x7f563b)
              .setDepth(100);

            // Ranking button (active.)
            const rankingBtn = this.add.rectangle(
              width * 0.75,
              height - 30,
              width * 0.5,
              60,
              0x7f563b,
            );
            rankingBtn.setOrigin(0.5, 0.5);
            rankingBtn.setStrokeStyle(2, 0x7f563b);
            rankingBtn.setInteractive({ useHandCursor: true });
            rankingBtn.setDepth(100);
            // Ranking icon.
            const rankingIcon = this.add.sprite(
              width * 0.75,
              height - 38,
              "rankingIcon",
            );
            rankingIcon.setTintFill(0xcaaa77);
            rankingIcon.setDepth(100);
            // Ranking text.
            this.add
              .bitmapText(width * 0.75, height - 16, "letters", "RANKING", 8)
              .setOrigin(0.5)
              .setTint(0xcaaa77)
              .setDepth(100);

            // Game Button event.
            gameBtn.on("pointerdown", () => {
              this.scene.stop("FlappyBirdScene");
              this.scene.start("FlappyBirdScene");
            });
            gameBtn.on("pointerover", () => {
              gameBtn.setFillStyle(0x7f563b);
              gameIcon.setTintFill(0xcaaa77);
              gameIconText.setTintFill(0xcaaa77);
            });
            gameBtn.on("pointerout", () => {
              gameBtn.setFillStyle(0xcaaa77);
              gameIcon.setTintFill(0x7f563b);
              gameIconText.setTintFill(0x7f563b);
            });
          }

          async getLeaderboardData() {
            return (await getTopPlayers()) ?? [];
          }
        }

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameContainerRef.current,
          pixelArt: true,
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false,
            },
          },
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 424,
            height: 695,
          },
          scene: [FlappyBirdScene, RankingScene],
        };

        // Destroy any existing game instance.
        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy(true);
        }

        // Create new game instance.
        gameInstanceRef.current = new Phaser.Game(config);
      }
    };

    initPhaser();

    // Cleanup.
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }
    };
  }, [fid, displayName]);

  return (
    <div className="w-full flex flex-col items-center relative">
      <div
        ref={gameContainerRef}
        className="w-full border border-gray-200 rounded-md overflow-hidden bg-gray-50"
      />
    </div>
  );
}
