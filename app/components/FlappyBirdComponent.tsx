"use client";

import { useLayoutEffect, useRef } from "react";

const HEARTS = 3;

export function FlappyBirdComponent() {
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
          private pipeSpacing: number = 400;
          private hearts: number = 0;
          private nextPipeX: number = 0;

          constructor() {
            super({ key: "FlappyBirdScene" });
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
            this.load.image("heartFull", "assets/player/heart-full.png");
            this.load.image("heartEmpty", "assets/player/heart-empty.png");
            this.load.image("tubeTop", "assets/tubes/tube-top.png");
            this.load.image("tubeBase", "assets/tubes/tube-base.png");
            this.load.image("background", "assets/background/background.png");
          }

          create() {
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
                30,
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
            this.hearts = this.fetchAvailableHearts();

            // Hearts.
            for (let i = 1; i < HEARTS + 1; i++) {
              const heart = this.add.image(
                20 + i * 35,
                40,
                i <= this.hearts ? "heartFull" : "heartEmpty",
              );
              heart.setDepth(99);
            }

            if (this.hearts === 0) {
              this.showPayForTryUI();
            }
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
                this.bird.angle + 1.0,
                -45,
                90,
              );
            } else {
              this.bird.angle = Phaser.Math.Clamp(
                this.bird.angle - 2.5,
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

            // Create a container for start overlay elements.
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

            // Tap to start text.
            const startText = this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5,
                "letters",
                "TAP TO START",
                16,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Add elements to container.
            this.startOverlay.add([overlay, startText]);

            // Set the overlay to be on top.
            this.startOverlay.setDepth(100);
          }

          startGame() {
            if (this.gameStarted || this.gameOver) return;

            this.gameStarted = true;
            this.scoreText?.setVisible(true);

            // Add gravity to bird after game starts.
            this.bird?.setGravityY(981);

            // Remove the start overlay.
            this.startOverlay?.destroy();

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

          handlePointerDown() {
            if (this.gameOver) return;

            if (!this.gameStarted && this.hearts > 0) {
              this.startGame();
            }

            this.jump();
          }

          jump() {
            if (this.gameOver || !this.bird || !this.gameStarted) return;
            this.bird.setVelocityY(-350);
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

            const yGap = 75;
            const height = this.game.config.height as number;
            const pipeTop = Phaser.Math.Between(100, height - yGap - 100);
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
                this.pipeSpeed = Math.min(500, 200 + this.score * 10);

                scoreZone.destroy();
              },
              undefined,
              this,
            );
          }

          fetchAvailableHearts() {
            // TODO: fetch available hearts.
            return HEARTS;
          }

          gameOverHandler() {
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
                const type = (child as Phaser.Physics.Arcade.Sprite).type;
                const textureKey = (child as Phaser.Physics.Arcade.Sprite)
                  .texture.key;
                const alpha = (child as Phaser.Physics.Arcade.Sprite).alpha;
                if (
                  type === "Sprite" &&
                  textureKey === "tubeTop" &&
                  alpha === 0
                ) {
                  (child as Phaser.Physics.Arcade.Sprite).setVelocityX(0);
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
            for (let i = 1; i < HEARTS + 1; i++) {
              const heart = this.add.image(
                20 + i * 35,
                40,
                i <= this.hearts ? "heartFull" : "heartEmpty",
              );
              heart.setDepth(99);
            }
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
              (this.game.config.height as number) * 0.5 + 20,
              150,
              40,
              0x4a752c,
            );
            retryButton.setOrigin(0.5);
            retryButton.setInteractive({ useHandCursor: true });
            this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 20,
                "letters",
                "RETRY",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Add share button.
            const shareButton = this.add.rectangle(
              (this.game.config.width as number) * 0.5,
              (this.game.config.height as number) * 0.5 + 70,
              150,
              40,
              0x3e84d5,
            );
            shareButton.setOrigin(0.5);
            shareButton.setInteractive({ useHandCursor: true });
            this.add
              .bitmapText(
                (this.game.config.width as number) * 0.5,
                (this.game.config.height as number) * 0.5 + 70,
                "letters",
                "SHARE",
                12,
              )
              .setOrigin(0.5)
              .setTint(0xffffff);

            // Restart event.
            retryButton.on("pointerdown", () => {
              // TODO: check if the user has any attempts left. If so, let
              // the user try again. Otherwise, ask them if they wants to
              // pay for another try.

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
                  const type = (child as Phaser.Physics.Arcade.Sprite).type;
                  const textureKey = (child as Phaser.Physics.Arcade.Sprite)
                    .texture.key;
                  const alpha = (child as Phaser.Physics.Arcade.Sprite).alpha;
                  if (
                    type === "Sprite" &&
                    child !== this.bird &&
                    textureKey === "tubeTop" &&
                    alpha === 0
                  ) {
                    child.destroy();
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
              }
            });
            retryButton.on("pointerover", () => {
              retryButton.setFillStyle(0x5d9639);
            });
            retryButton.on("pointerout", () => {
              retryButton.setFillStyle(0x4a752c);
            });

            // Share event.
            shareButton.on("pointerdown", () => {
              // TODO: Implement share logic.
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
              console.log("Payment button clicked.");

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
                const type = (child as Phaser.Physics.Arcade.Sprite).type;
                const textureKey = (child as Phaser.Physics.Arcade.Sprite)
                  .texture.key;
                const alpha = (child as Phaser.Physics.Arcade.Sprite).alpha;
                if (
                  type === "Sprite" &&
                  child !== this.bird &&
                  textureKey === "tubeTop" &&
                  alpha === 0
                ) {
                  child.destroy();
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
                  20 + i * 35,
                  40,
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
          },
          scene: [FlappyBirdScene],
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
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-bold my-4">Flappy Bird</h2>
      <div
        ref={gameContainerRef}
        className="w-full border border-gray-200 rounded-md overflow-hidden bg-gray-50"
      />
      <p className="mt-4 text-sm text-gray-500 text-center">
        Press SPACE or click/tap on the screen to make the bird flap and avoid
        obstacles!
      </p>
    </div>
  );
}
