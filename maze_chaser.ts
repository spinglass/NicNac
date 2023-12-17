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
        ExitBase,
        Scatter,
        Chase,
        Frightened,
        ReturnToBase,
        EnterBase,
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
        release: boolean
        base: Pos
        exit: Pos

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
            this.base = this.maze.map.bases[this.id]
            this.exit = this.maze.map.bases[0]
            this.release = false
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
            if (this.waitDir == Direction.Up && this.release) {
                this.mode = ChaserMode.ExitBase
            }
            return true
        }

        private checkExitBase(): boolean {
            const minY = this.maze.map.returnBase.cy
            if (this.mover.y <= minY) {
                this.mover.placeAtPos(this.maze.map.bases[0].x, this.maze.map.bases[0].y)
                this.mode = ChaserMode.None
            }
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

        private doWait(): boolean {
            this.mover.updateState()

            const minY = this.base.y - 4
            const maxY = this.base.y + 4
            this.mover.forceUpdate(this.waitDir, minY, maxY)
            this.mover.setImage()

            // switch direction when hit limits
            if (this.mover.y <= minY) {
                this.waitDir = Direction.Down
            }
            if (this.mover.y >= maxY) {
                this.waitDir = Direction.Up
            }

            return false
        }

        private doExitBase(): boolean {
            this.mover.updateState()

            // return to y center
            if ((this.waitDir == Direction.Up && this.mover.y > this.base.y) || (this.waitDir == Direction.Down && this.mover.y < this.base.y))
            {
                // complete wait cycle
                return this.doWait()
            }

            // move to center
            if (this.base.x < this.exit.x && this.mover.x < this.exit.x) {
                this.mover.forceUpdate(Direction.Right, this.mover.x, this.exit.x)
                this.mover.setImage()
                return false
            }
            if (this.base.x > this.exit.x && this.mover.x > this.exit.x) {
                this.mover.forceUpdate(Direction.Left, this.exit.x, this.mover.x)
                this.mover.setImage()
                return false
            }

            // move out
            const minY = this.exit.y
            this.mover.forceUpdate(Direction.Up, minY, 1000)
            this.mover.setImage()

            return false
        }

        private doScatter(): boolean {
            if (this.mover.changedTile) {
                this.target = this.maze.map.scatterTargets[this.id]
                this.doTarget()
            }
            return true
        }

        private doChase(): boolean {
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
            return true
        }

        private doFrightened(): boolean {
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
            return true
        }

        private doReturnToBase(): boolean {
            this.target = this.maze.map.returnBase
            this.doTarget()
            return true
        }

        private checkMode(): boolean {
            switch (this.mode) {
                case ChaserMode.None:           return this.checkNone()
                case ChaserMode.Wait:           return this.checkWait()
                case ChaserMode.ExitBase:       return this.checkExitBase()
                case ChaserMode.Scatter:
                case ChaserMode.Chase:
                case ChaserMode.Frightened:     return this.checkStandard()
                case ChaserMode.ReturnToBase:   return this.checkReturnTobase()
            }
            return false
        }

        private doMode(): boolean {
            switch (this.mode) {
                case ChaserMode.Wait:           return this.doWait()
                case ChaserMode.ExitBase:       return this.doExitBase()
                case ChaserMode.Scatter:        return this.doScatter()
                case ChaserMode.Chase:          return this.doChase()
                case ChaserMode.Frightened:     return this.doFrightened()
                case ChaserMode.ReturnToBase:   return this.doReturnToBase()
            }
            return true
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
                case ChaserMode.ExitBase:
                case ChaserMode.EnterBase:
                    this.mover.speed = speedChaserWait
            }
        }

        update() {
            if (!this.mover.isReady()) {
                return
            }

            // check current mode
            // this tells us if we need to do further work to apply the mode
            let update = true
            if (this.checkMode()) {
                update = this.doMode()
            }

            this.updateSpeed()

            if (update) {
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

        setRelease() {
            this.release = true
        }

        place() {
            this.mover.placeAtPos(this.base.x, this.base.y)
            this.mode = ChaserMode.Wait
            this.waitDir = Direction.Up
        }

        doEaten() {
            this.mode = ChaserMode.ReturnToBase
        }
    }
}