namespace maze {
    export class Nom {
        mover: Mover
        img: DirImage
        id: number
        active: boolean
        target: Tile

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
                this.findNearestPill()
                this.doTarget()
            }
        }

        setEaten() {
            this.active = false
            this.mover.setVisible(false)
        }

        private doTarget() {
            if (!this.target) {
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
                if (this.mover.isDirectionValid(dir) && dir != directionOpposite(this.mover.dir)) {
                    this.mover.request = dir
                    break
                }
            }
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