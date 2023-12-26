namespace maze {
    enum NomMode {
        None,
        Fright,
        Hunger,
    }

    export class Nom {
        mover: Mover
        img: DirImage
        id: number
        active: boolean
        target: Tile
        mode: NomMode

        constructor(id: number) {
            this.mover = new Mover()
            this.img = new DirImage()
            this.id = id
            this.active = false
        }

        init() {
            this.img.load("hero")
            this.mover.init(this.img)
        }

        initLevel() {
            this.mover.hx = map.bases[this.id].cx
            this.mover.hy = map.bases[this.id].cy
            this.mover.place()
            this.mover.speed = level.speedChaser
            this.active = true
        }

        resetLevel() {
            if (this.active) {
                this.mover.place()
                this.mover.setImage()
            }
        }

        update() {
            if (!this.active || !this.mover.isReady()) {
                return
            }

            this.mover.update()
            this.mover.setImage()
            
            // eat pills
            if (this.mover.changedTile) {
                if (map.eatPill(this.mover.tile)) {
                    events.fire(Event.EatPill)
                } else if (map.eatPower(this.mover.tile)) {
                    events.fire(Event.EatPower)
                }
            }

            if (this.mover.isStopped() || this.mover.changedTile) {
                this.updateMode()
                if (this.mode == NomMode.Fright) {
                    this.findSafePlace()
                } else {
                    this.findNearestPill()
                }
                this.doTarget()
            }
        }

        setEaten() {
            this.active = false
            this.mover.setVisible(false)
        }

        private updateMode() {
            const frightDist = 8 + this.id           
            const dist = Math.abs(antiHero.mover.tile.tx - this.mover.tile.tx) + Math.abs(antiHero.mover.tile.ty - this.mover.tile.ty)
            if (dist < frightDist) {
                this.mode = NomMode.Fright
            } else {
                this.mode = NomMode.Hunger
            }
        }

        private doTarget() {
            if (!this.target) {
                this.doRandom()
                return
            }

            // get distance to target in each axis
            const dx = (this.target.tx - this.mover.tile.tx)
            const dy = (this.target.ty - this.mover.tile.ty)

            // decide prefered direction for each axis, based on which axis is furthest
            const dirX = (dx > 0) ? Direction.Right : Direction.Left
            const dirY = (dy > 0) ? Direction.Down : Direction.Up

            let dirs: Direction[]
            if (Math.abs(dx) > Math.abs(dy)) {
                // Want to right direction in x then y
                dirs = [dirX, dirY, directionOpposite(dirY), directionOpposite(dirX)]
            } else {
                // Want to right direction in y then x
                dirs = [dirY, dirX, directionOpposite(dirX), directionOpposite(dirY)]
            }

            // request the first direction that is allowed
            for (const dir of dirs) {
                const isOpposite = (dir == directionOpposite(this.mover.dir))
                if (this.mover.isDirectionValid(dir) && !isOpposite) {
                    this.mover.request = dir
                    break
                }
            }
        }

        private doRandom() {
            let dirs: Direction[] = [Direction.Up, Direction.Right, Direction.Down, Direction.Left]
            let options: Direction[] = []

            // determine which directions are possible
            dirs.forEach(dir => {
                if (this.mover.isDirectionValid(dir) && this.mover.dir != directionOpposite(dir)) {
                    options.push(dir)
                }
            })

            // randomly pick one
            if (options.length > 0) {
                const ran = Math.randomRange(0, options.length - 1)
                this.mover.request = options[ran]
            }
        }

        private findSafePlace() {
            const dx = (this.mover.tile.tx - antiHero.mover.tile.tx)
            const dy = (this.mover.tile.ty - antiHero.mover.tile.ty)
            this.target = new Tile(this.mover.tile.tx + dx, this.mover.tile.ty + dy)
        }

        private findNearestPill()
        {
            let minDist = 1000
            let minTile = null
            for (let tx = 0; tx < map.w; ++tx) {
                for (let ty = 0; ty < map.h; ++ty) {
                    const tile = new Tile(tx, ty)
                    if (map.getFlag(tile, MapFlags.Pill))
                    {
                        const dist = Math.abs(this.mover.tile.tx - tx) + Math.abs(this.mover.tile.ty - ty)
                        if (dist < minDist) {
                            minDist = dist
                            minTile = tile
                        }
                    }
                }
            }
            this.target = minTile
        }
    }
}