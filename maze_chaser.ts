namespace maze {
    export enum ChaserKind {
        Blinky,
        Pinky,
        Inky,
        Clyde,
    }

    export enum ChaserMode {
        Scatter,
        Chase,
        Frightened
    }

    export class Chaser {
        maze: Maze
        mover: Mover
        kind: ChaserKind
        id: number
        ready: boolean
        mode: ChaserMode
        target: Tile

        constructor(kind: ChaserKind, id: number) {
            this.mover = new Mover()
            this.kind = kind
            this.id = id
        }

        init() {
            this.maze = getMaze()
            this.mover.init("chaser" + this.id)
            this.mover.mapType = MapFlags.Maze
            this.mode = ChaserMode.Frightened

            // only blink is ready straight away
            this.ready = (this.kind == ChaserKind.Blinky)
        }

        initLevel() {
            this.mover.hx = this.maze.map.bases[this.id].x
            this.mover.hy = this.maze.map.bases[this.id].y
            this.mover.place()
        }

        private isDirectionValid(dir: Direction): boolean {
            // check can move that direction and its now the opposite to current
            return (this.mover.isDirectionValid(dir) && this.mover.dir != opposite(dir))
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

        private doScatter() {
            this.target = this.maze.map.scatterTargets[this.id]
            this.doTarget()
        }

        private doChase() {

        }

        private doFrightened() {
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

        update() {
            if (!this.mover.isReady()) {
                return
            }

            // check if a decision is required
            if (this.ready) {
                const stopped = this.mover.isStopped()
                if (stopped || this.mover.changedTile) {
                    // Select the required behaviour
                    switch(this.mode) {
                        case ChaserMode.Scatter:
                            this.doScatter()
                            break
                        case ChaserMode.Chase:
                            this.doChase()
                            break
                        case ChaserMode.Frightened:
                            this.doFrightened()
                            break
                    }
                }
            }

            this.mover.update()
        }
    }
}