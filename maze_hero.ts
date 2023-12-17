namespace maze {
    const speedHero = 80
    const immortal = false
    
    export class Hero {
        maze: Maze
        mover: Mover
        images: DirImage

        constructor() {
            this.mover = new Mover()
            this.images = new DirImage()
        }

        init() {
            this.maze = getMaze()
            this.images.load("hero")
            this.mover.init(this.images)
            this.mover.mapType = MapFlags.Maze
        }

        initLevel() {
            this.mover.hx = this.maze.map.home.x
            this.mover.hy = this.maze.map.home.y
            this.mover.place()
            this.mover.speed = speedHero
        }

        update() {
            if (!this.mover.isReady()) {
                return
            }

            if (controller.up.isPressed()) {
                this.mover.request = Direction.Up
            } else if (controller.down.isPressed()) {
                this.mover.request = Direction.Down
            } else if (controller.left.isPressed()) {
                this.mover.request = Direction.Left
            } else if (controller.right.isPressed()) {
                this.mover.request = Direction.Right
            }

            this.mover.update()
            this.mover.setImage()

            // eat pills
            if (this.mover.changedTile) {
                if (this.maze.map.eatPill(this.mover.tile)) {
                    this.maze.events.fire(Event.EatPill)
                } else if (this.maze.map.eatPower(this.mover.tile)) {
                    this.maze.events.fire(Event.EatPower)
                }
            }

            // check for eating or losing a life
            for (const chaser of this.maze.chasers) {
                if (this.mover.tile.tx == chaser.mover.tile.tx && this.mover.tile.ty == chaser.mover.tile.ty)
                {
                    if (chaser.mode == ChaserMode.Scatter || chaser.mode == ChaserMode.Chase) {
                        if (!immortal) {
                            this.maze.events.fire(Event.LoseLife)

                            // can only get eaten once per life!
                            break
                        }
                    }
                    if (chaser.mode == ChaserMode.Fright) {
                        this.maze.events.fire(Event.EatChaser)

                        // send the chaser home
                        chaser.doEaten()

                        // also only one per frame, so both score events are seen
                        break
                    }                  
                }

                // Also check by distance to prevent the pass-through bug, but only for fright,
                // as otherwise the player can feel cheated
                // Leaving for being eaten though, as it's like a bonus get-out-of-jail card
                if (chaser.mode == ChaserMode.Fright) {
                    const dx = Math.abs(chaser.mover.x - this.mover.x)
                    const dy = Math.abs(chaser.mover.y - this.mover.y)
                    if (dx < 4 && dy < 4) {
                        this.maze.events.fire(Event.EatChaser)

                        // send the chaser home
                        chaser.doEaten()

                        // also only one per frame, so both score events are seen
                        break
                    }
                }
            }
        }

        place() {
            this.mover.place()
            this.mover.setImage()
        }
    }
}
