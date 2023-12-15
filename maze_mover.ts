namespace maze {
    export class Mover {
        sprite: Sprite
        x: number                   // world x
        y: number                   // world y
        tx: number                  // tilemap x (col)
        ty: number                  // tilemap y (row)
        hx: number                  // home y
        hy: number                  // home x
        validDirs: number
        direction: Direction
        request: Direction
        speed: number
        visible: boolean
        frozen: boolean
        fvx: number                 // frozen speed x
        fvy: number                 // frozen speed y
        changedTile: boolean
        mapType: MapFlags

        constructor() {
            this.x = 0
            this.y = 0
            this.tx = 0
            this.ty = 0
            this.validDirs = 0
            this.direction = Direction.None
            this.request = Direction.None
            this.speed = 80
            this.visible = false
            this.frozen = false
            this.fvx = 0
            this.fvy = 0
            this.changedTile = false
            this.mapType = MapFlags.None
        }

        private updateState() {
            // get tile coords
            this.x = this.sprite.x
            this.y = this.sprite.y
            this.tx = (this.x >> 3)
            this.ty = (this.y >> 3)

            // check which directions can travel from this tile
            this.validDirs = 0
            this.checkTile(this.tx, this.ty - 1, Direction.Up)
            this.checkTile(this.tx + 1, this.ty, Direction.Right)
            this.checkTile(this.tx, this.ty + 1, Direction.Down)
            this.checkTile(this.tx - 1, this.ty, Direction.Left)
        }

        get vx(): number { return this.sprite.vx }
        get vy(): number { return this.sprite.vy }

        init(img: Image) {
            this.sprite = sprites.create(img, SpriteKind.Player)

            // Hide until placed
            this.setVisible(false)
        }

        reset() {
            this.setVisible(false)
        }

        place() {
            this.sprite.x = this.hx
            this.sprite.y = this.hy
            this.sprite.vx = 0
            this.sprite.vy = 0
            this.direction = Direction.None
            this.request = Direction.None
            this.changedTile = false
            this.updateState()
            this.setVisible(true)
        }

        setVisible(visible: boolean) {
            this.visible = visible
            this.sprite.setFlag(SpriteFlag.Ghost, !visible)
            this.sprite.setFlag(SpriteFlag.Invisible, !visible)
        }

        update() {
            if (!this.isReady()) {
                return
            }

            // get previous state
            const px = this.x
            const py = this.y
            const ptx = this.tx
            const pty = this.ty

            this.updateState()

            this.changedTile = (this.tx != ptx) || (this.ty != pty)

            // Ignore if request is same as current direction
            if (this.request == this.direction) {
                this.request = Direction.None
            }

            const stopped = (this.vx == 0 && this.vy == 0)

            let crossing = false
            const cx = (8 * this.tx) + 4    // centre of tile x
            const cy = (8 * this.ty) + 4    // centre of tile y
            if (!stopped) {
                // Check for crossing centre of tile
                if (this.direction == Direction.Up) {
                    crossing = (py > cy && cy >= this.y)
                } else if (this.direction == Direction.Down) {
                    crossing = (py < cy && cy <= this.y)
                } else if (this.direction == Direction.Left) {
                    crossing = (px > cx && cx >= this.x)
                } else if (this.direction == Direction.Right) {
                    crossing = (px < cx && cx <= this.x)
                }
            }

            if (this.direction != Direction.None) {
                // Can reverse direction at any time
                if (this.direction == opposite(this.request)) {
                    this.direction = this.request
                    this.request = Direction.None
                }
                // Stop current direction if reached tile centre and can't continue
                else if ((stopped || crossing) && !this.isDirectionValid(this.direction)) {
                    this.direction = Direction.None
                }
            }

            // Apply requested direction if it's possible
            if ((stopped || crossing) && this.isDirectionValid(this.request)) {
                this.direction = this.request
                this.request = Direction.None
            }

            // apply to sprite
            switch (this.direction) {
                case Direction.None:
                    this.sprite.vx = 0
                    this.sprite.vy = 0
                    break
                case Direction.Up:
                    this.sprite.vx = 0
                    this.sprite.vy = -this.speed
                    this.sprite.x = cx
                    break
                case Direction.Down:
                    this.sprite.vx = 0
                    this.sprite.vy = this.speed
                    this.sprite.x = cx
                    break
                case Direction.Left:
                    this.sprite.vx = -this.speed
                    this.sprite.vy = 0
                    this.sprite.y = cy
                    break
                case Direction.Right:
                    this.sprite.vx = this.speed
                    this.sprite.vy = 0
                    this.sprite.y = cy
                    break
            }
        }

        setFreeze(freeze: boolean) {
            this.frozen = freeze
            if (freeze) {
                this.fvx = this.vx
                this.fvy = this.vy
                this.sprite.vx = 0
                this.sprite.vy = 0
            } else {
                this.sprite.vx = this.fvx
                this.sprite.vy = this.fvy
            }
        }

        isReady(): boolean {
            return (this.sprite && this.visible && !this.frozen)
        }

        isDirectionValid(dir: Direction): boolean {
            return (this.validDirs & dir) != 0
        }

        private checkTile(tx: number, ty: number, dir: Direction) {
            const map = getMaze().map
            if (map.getFlag(tx, ty, this.mapType)) {
                this.validDirs |= dir
            }
        }
    }
}
