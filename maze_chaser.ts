namespace maze {
    const speedChaser = 75
    const speedChaserFright = 40
    const speedChaserWait = 40

    export enum ChaserKind {
        Blinky,
        Pinky,
        Inky,
        Clyde,
    }

    export enum ChaserMode {
        None,
        Wait,
        Scatter,
        Chase,
        Frightened,
        ReturnToBase,
    }

    export class Chaser {
        maze: Maze
        mover: Mover
        kind: ChaserKind
        id: number
        mode: ChaserMode        // mode this chaser is using
        gameMode: ChaserMode    // mode the game requested
        target: Tile
        imgFright: Image
        imgReturn: Image
        waitDir: Direction

        constructor(kind: ChaserKind, id: number) {
            this.mover = new Mover()
            this.kind = kind
            this.id = id
        }

        init() {
            this.maze = getMaze()
            this.mover.init("chaser" + this.id)
            this.mover.mapType = MapFlags.Maze
            this.imgFright = helpers.getImageByName("chaser_fright")
            this.imgReturn = helpers.getImageByName("chaser_return")
        }

        initLevel() {
            this.mover.hx = this.maze.map.bases[this.id].x
            this.mover.hy = this.maze.map.bases[this.id].y
            this.place()
        }

        private isDirectionValid(dir: Direction): boolean {
            // check can move that direction and its now the opposite to current
            return (this.mover.isDirectionValid(dir) && this.mover.dir != opposite(dir))
        }

        private checkNone(): boolean {
            this.mode = this.maze.game.chaserMode
            this.mover.request = Direction.Left
            return false
        }

        private checkWait(): boolean {
            
            return true
        }

        private checkStandard(): boolean {
            if (this.mode != this.gameMode) {
                const prev = this.mode
                this.mode = this.gameMode

                if (prev != ChaserMode.Frightened) {
                    // reverse
                    this.mover.request = opposite(this.mover.dir)

                    // no further update
                    return false
                }
            }

            // let the update run
            return true
        }

        private checkReturnTobase() {
            if (this.mover.tile.tx == this.maze.map.returnBase.tx && this.mover.tile.ty == this.maze.map.returnBase.ty) {
                if (this.gameMode == ChaserMode.Frightened) {
                    // game is still in frightened mode, but we just recovered from that,
                    // so go straight to chase
                    this.mode = ChaserMode.Chase
                    this.gameMode = ChaserMode.Chase
                } else {
                    this.mode = this.gameMode
                }

                this.mover.request = Direction.Left
                
                // no further update
                return false
            }

            // let the update run
            return true
        }
        
        private checkMode(): boolean {
            switch (this.mode) {
                case ChaserMode.None: return this.checkNone()
                case ChaserMode.Wait: return this.checkWait()
                case ChaserMode.Scatter:
                case ChaserMode.Chase:
                case ChaserMode.Frightened: return this.checkStandard()
                case ChaserMode.ReturnToBase: return this.checkReturnTobase()
            }
            return false
        }
        
        private doTarget() {
            // get distance to target in each axis
            const dx = (this.target.tx - this.mover.tile.tx)
            const dy = (this.target.ty - this.mover.tile.ty)

            // decide prefered direction for each axis, based on which axis is furthest
            const dirX = (dx > 0) ? Direction.Right : Direction.Left
            const dirY = (dy > 0) ? Direction.Down : Direction.Up

            let dirs: Direction[]
            if (Math.abs(dx) > Math.abs(dy)) {
                // Want to right direction in x then y
                dirs = [dirX, dirY, opposite(dirY), opposite(dirX)]
            } else {
                // Want to right direction in y then x
                dirs = [dirY, dirX, opposite(dirX), opposite(dirY)]
            }

            // request the first direction that is allowed
            for (const dir of dirs) {
                if (this.isDirectionValid(dir)) {
                    this.mover.request = dir
                    break
                }
            }
        }

        private doWait() {
            const minY = this.mover.hy - 4
            const maxY = this.mover.hy + 4
            this.mover.forceUpdate(this.waitDir, minY, maxY)
            this.mover.setImage()

            if (this.mover.y < minY) {
                this.waitDir = Direction.Down
            }
            if (this.mover.y > maxY) {
                this.waitDir = Direction.Up
            }
        }

        private doScatter() {
            if (this.mover.changedTile) {
                this.target = this.maze.map.scatterTargets[this.id]
                this.doTarget()
            }
        }

        private doChase() {
            if (this.mover.changedTile) {
                // generate target
                switch(this.kind) {
                    case ChaserKind.Blinky:
                        this.target = this.maze.hero.mover.tile
                        break
                    case ChaserKind.Pinky:
                        // TODO correct Pinky target
                        this.target = this.maze.hero.mover.tile
                        break
                    case ChaserKind.Inky:
                        // TODO correct Inky target
                        this.target = this.maze.hero.mover.tile
                        break
                    case ChaserKind.Clyde:
                        // TODO correct Clyde target
                        this.target = this.maze.hero.mover.tile
                        break
                }
                this.doTarget()
            }
        }

        private doFrightened() {
            if (this.mover.changedTile) {
                let dirs: Direction[] = [Direction.Up, Direction.Right, Direction.Down, Direction.Left]
                let options: Direction[] = []

                // determine which directions are possible
                dirs.forEach(dir => {
                    if (this.isDirectionValid(dir)) {
                        options.push(dir)
                    }
                })

                // randomly pick one
                if (options.length > 0) {
                    const ran = Math.randomRange(0, options.length - 1)
                    this.mover.request = options[ran]
                }
            }
        }

        private doReturnTobase() {
            this.target = this.maze.map.returnBase
            this.doTarget()
        }

        private updateSpeed() {
            switch (this.mode) {
                default:
                    this.mover.speed = speedChaser
                    break
                case ChaserMode.Frightened:
                    this.mover.speed = speedChaserFright
                    break
                case ChaserMode.Wait:
                    this.mover.speed = speedChaserWait
            }
        }

        update() {
            if (!this.mover.isReady()) {
                return
            }

            // check current mode
            // this tells us if we need to do further work to apply the mode
            if (this.checkMode()) {
                // apply mode
                switch (this.mode) {
                    case ChaserMode.Wait:           this.doWait(); break
                    case ChaserMode.Scatter:        this.doScatter(); break
                    case ChaserMode.Chase:          this.doChase(); break
                    case ChaserMode.Frightened:     this.doFrightened(); break
                    case ChaserMode.ReturnToBase:   this.doReturnTobase(); break
                }
            }

            this.updateSpeed()

            if (this.mode != ChaserMode.Wait) {
                this.mover.update()
            }

            if (this.mode == ChaserMode.Frightened) {
                this.mover.sprite.setImage(this.imgFright)
            } else if (this.mode == ChaserMode.ReturnToBase) {
                this.mover.sprite.setImage(this.imgReturn)
            } else {
                this.mover.setImage()
            }
        }

        setMode(mode: ChaserMode) {
            // this doesn't set the _actual_ mode, we might be in the middle of something,
            // or not ready, etc.
            this.gameMode = mode
        }

        place() {
            this.mover.place()
            this.mode = (this.kind == ChaserKind.Blinky) ? ChaserMode.None : ChaserMode.Wait
            this.waitDir = Direction.Up
        }

        doEaten() {
            this.mode = ChaserMode.ReturnToBase
        }
    }
}