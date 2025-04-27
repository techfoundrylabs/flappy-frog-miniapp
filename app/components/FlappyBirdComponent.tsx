"use client";

import { useEffect, useRef } from "react";

export function FlappyBirdComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initPhaser = async () => {
      if (typeof window !== "undefined" && gameContainerRef.current) {
        const Phaser = (await import("phaser")).default;
        
        class FlappyBirdScene extends Phaser.Scene {
          private bird: Phaser.Physics.Arcade.Sprite | null = null;
          private pipes: Phaser.Physics.Arcade.Group | null = null;
          private score: number = 0;
          private scoreText: Phaser.GameObjects.Text | null = null;
          private gameOver: boolean = false;
          private pipeSpeed: number = 200;
          
          constructor() {
            super({ key: "FlappyBirdScene" });
          }
          
          preload() {
            this.load.image("bird", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
            this.load.image("pipe", "https://labs.phaser.io/assets/sprites/column.png");
            this.load.image("sky", "https://labs.phaser.io/assets/skies/sky1.png");
          }
          
          create() {
            // Background.
            this.add.image(0, 0, "sky").setOrigin(0, 0).setDisplaySize(this.game.config.width as number, this.game.config.height as number);
            
            // Bird.
            this.bird = this.physics.add.sprite(100, 300, "bird");
            this.bird.setScale(0.5);
            this.bird.setGravityY(700);
            
            // Physics Group object.
            this.pipes = this.physics.add.group();
            
            // Score.
            this.scoreText = this.add.text(20, 20, "Score: 0", { 
              fontFamily: "Arial", 
              fontSize: "24px",
              color: "#000" 
            });
            
            // Add pipe timer.
            this.time.addEvent({
              delay: 1500,
              callback: this.addPipes,
              callbackScope: this,
              loop: true
            });
            
            // Input handling.
            this.input.on("pointerdown", this.jump, this);
            this.input.keyboard?.on("keydown-SPACE", this.jump, this);
            
            // Add a Physic Collider object.
            if (this.bird && this.pipes) {
              this.physics.add.collider(this.bird, this.pipes, this.gameOverHandler, undefined, this);
            }
          }
          
          update() {
            if (this.gameOver || !this.bird) return;
            
            // Rotate bird based on velocity.
            if (this.bird.body!.velocity.y > 0) {
              this.bird.angle += 1;
            } else {
              this.bird.angle -= 2.5;
            }
            
            // Game over if bird goes out of bounds.
            if (this.bird.y > (this.game.config.height as number) || this.bird.y < 0) {
              this.gameOverHandler();
            }
          }
          
          jump() {
            if (this.gameOver || !this.bird) return;
            this.bird.setVelocityY(-350);
          }
          
          addPipes() {
            if (this.gameOver || !this.pipes) return;
            
            const gap = 150;
            const height = this.game.config.height as number;
            const pipeTop = Phaser.Math.Between(100, height - gap - 100);
            
            // Top pipe.
            const topPipe = this.pipes.create(
              this.game.config.width as number, 
              pipeTop - 320, 
              "pipe"
            );
            topPipe.body.allowGravity = false;
            topPipe.setVelocityX(-this.pipeSpeed);
            topPipe.setImmovable(true);
            
            // Bottom pipe.
            const bottomPipe = this.pipes.create(
              this.game.config.width as number, 
              pipeTop + gap, 
              "pipe"
            );
            bottomPipe.body.allowGravity = false;
            bottomPipe.setVelocityX(-this.pipeSpeed);
            bottomPipe.setImmovable(true);
            
            // Increment score when passing through pipes.
            this.time.delayedCall(2000, () => {
              if (!this.gameOver) {
                this.score += 1;
                if (this.scoreText) {
                  this.scoreText.setText(`Score: ${this.score}`);
                }
                
                // Increase pipe speed as score increases.
                this.pipeSpeed = Math.min(500, 200 + this.score * 10);
                
                // Update velocity for all existing pipes.
                this.pipes?.getChildren().forEach((pipe) => {
                  (pipe.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.pipeSpeed);
                });
              }
            });
          }
          
          gameOverHandler() {
            this.gameOver = true;
            
            if (this.bird && this.pipes) {
              this.bird.setTint(0xff0000);
              this.physics.pause();
              
              // Add game over text.
              this.add.text(
                this.game.config.width as number / 2,
                this.game.config.height as number / 2,
                "Game Over\nClick to restart",
                { 
                  fontFamily: "Arial", 
                  fontSize: "36px", 
                  color: "#000",
                  align: "center" 
                }
              ).setOrigin(0.5);
              
              // Add restart input.
              this.input.on("pointerdown", () => {
                this.scene.restart();
                this.score = 0;
                this.gameOver = false;
                this.pipeSpeed = 200;
              });
            }
          }
        }
        
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameContainerRef.current,
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false
            }
          },
          scene: [FlappyBirdScene]
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
        className="w-full max-w-[800px] h-[600px] border border-gray-200 rounded-md overflow-hidden bg-gray-50"
      />
      <p className="mt-4 text-sm text-gray-500 text-center">
        Press SPACE or click/tap on the screen to make the bird flap and avoid obstacles!
      </p>
    </div>
  );
}