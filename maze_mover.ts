namespace maze {
    export class Mover {
        sprite: Sprite
        images: DirImage
        tile: Tile
        x: number                   // world x
        y: number                   // world y
        hx: number                  // home y
        hy: number                  // home x
        validDirs: number
        dir: Direction
        request: Direction
        speed: number
        visible: boolean
        frozen: boolean
        fvx: number                 // frozen speed x
        fvy: number                 // frozen speed y
        changedTile: boolean
        crossedTile: boolean        // crossed the center of current tile this frame
        crossedX: boolean
        crossedY: boolean
        fastTurn: boolean

        constructor() {
            this.images = new DirImage()
            this.x = 0
            this.y = 0
            this.tile = new Tile(0, 0)
            this.validDirs = 0
            this.dir = Direction.None
            this.request = Direction.None
            this.speed = 80
            this.visible = false
            this.frozen = true
            this.fvx = 0
            this.fvy = 0
            this.changedTile = false
            this.fastTurn = false
        }

        init(images: DirImage) {         
            this.images = images
            this.sprite = sprites.create(this.images.img)

            // Hide until placed
            this.setVisible(false)
        }
        
        updateState() {
            // get previous state
            const px = this.x
            const py = this.y
            const ptile = this.tile

            // get tile coords
            this.x = this.sprite.x
            this.y = this.sprite.y
            this.tile = getTileFromWorldPosition(this.x, this.y)
            this.changedTile = (this.tile.tx != ptile.tx) || (this.tile.ty != ptile.ty)

            // Check for crossing centre of tile
            const cx = this.tile.cx
            const cy = this.tile.cy
            if (this.sprite.vx > 0) {
                this.crossedX = (px < cx && cx <= this.x)
            }
            else {
                this.crossedX = (this.x <= cx && cx < px)
            }
            if (this.sprite.vy > 0) {
                this.crossedY = (py < cy && cy <= this.y)
            } else {
                this.crossedY = (this.y <= cy && cy < py)
            }
            if (this.dir == Direction.Left || this.dir == Direction.Right) {
                this.crossedTile = this.crossedX
            } else if (this.dir == Direction.Up || this.dir == Direction.Down) {
                this.crossedTile = this.crossedY
            }

            // check which directions can travel from this tile
            this.validDirs = 0
            this.checkTile(Direction.Up)
            this.checkTile(Direction.Right)
            this.checkTile(Direction.Down)
            this.checkTile(Direction.Left)
        }

        private applyDir() {
            switch (this.dir) {
                case Direction.None:
                    this.sprite.vx = 0
                    this.sprite.vy = 0
                    break
                case Direction.Up:
                    this.sprite.vx = 0
                    this.sprite.vy = -this.speed
                    break
                case Direction.Down:
                    this.sprite.vx = 0
                    this.sprite.vy = this.speed
                    break
                case Direction.Left:
                    this.sprite.vx = -this.speed
                    this.sprite.vy = 0
                    break
                case Direction.Right:
                    this.sprite.vx = this.speed
                    this.sprite.vy = 0
                    break
            }
        }

        private applyCentre() {
            const cx = this.tile.cx
            const cy = this.tile.cy
            if (this.fastTurn) {
                if (this.dir == Direction.Left || this.dir == Direction.Right) {
                    if (this.crossedY) {
                        this.sprite.y = cy
                    } else if (this.sprite.y > cy) {
                        this.sprite.vy = -this.speed
                    } else if (this.sprite.y < cy) {
                        this.sprite.vy = this.speed
                    }
                } else {
                    if (this.crossedX) {
                        this.sprite.x = cx
                    } else if (this.sprite.x > cx) {
                        this.sprite.vx = -this.speed
                    } else if (this.sprite.x < cx) {
                        this.sprite.vx = this.speed
                    }
                }
            } else {
                switch (this.dir) {
                    case Direction.Up:
                    case Direction.Down:
                        this.sprite.x = cx
                        break
                    case Direction.Left:
                    case Direction.Right:
                        this.sprite.y = cy
                        break
                }
            }
        }

        setImage() {
            this.images.apply(this.sprite, this.dir)
        }

        place() {
            this.placeAtPos(this.hx, this.hy)
            this.sprite.setImage(this.images.img)
        }

        placeAtPos(x: number, y: number) {
            this.sprite.x = x
            this.sprite.y = y
            this.sprite.vx = 0
            this.sprite.vy = 0
            this.dir = Direction.None
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

            this.updateState()

            // ignore if request is same as current direction
            if (this.request == this.dir) {
                this.request = Direction.None
            }

            if (this.changedTile) {
                // check for tunnel
                const exit = map.useTunnel(this.tile)
                if (exit) {
                    // keep current speed and warp to exit
                    this.sprite.x = exit.cx
                    this.sprite.y = exit.cy
                    this.updateState()
                    return
                }
            }
            
            const stopped = this.isStopped()
            if (!stopped && this.crossedTile && !this.isDirectionValid(this.dir)) {
                // cannot continue this direction, clamp position
                this.sprite.x = this.tile.cx
                this.sprite.y = this.tile.cy
            }

            if (this.dir != Direction.None) {
                // Can reverse direction at any time
                if (this.dir == opposite(this.request)) {
                    this.dir = this.request
                    this.request = Direction.None
                }
                // Stop current direction if reached tile centre and can't continue
                else if ((stopped || this.crossedTile) && !this.isDirectionValid(this.dir)) {
                    this.dir = Direction.None
                }
            }

            let canChangeDir = false
            if (this.fastTurn)  {
                const cx = this.tile.cx
                const cy = this.tile.cy
                if (this.dir == Direction.Left || this.dir == Direction.Right) {
                    canChangeDir = (cx - 4 <= this.x && this.x <= cx + 4)
                } else {
                    canChangeDir = (cy - 4 <= this.y && this.y <= cy + 4)
                }
            } else {
                canChangeDir = this.crossedTile
            }

            // Apply requested direction if it's possible
            if ((stopped || canChangeDir) && this.isDirectionValid(this.request)) {
                this.dir = this.request
                this.request = Direction.None
            }

            this.applyDir()
            this.applyCentre()
        }

        forceUpdate(dir: Direction, minx: number, maxx: number, miny: number, maxy: number) {
            if (!this.isReady()) {
                return
            }

            this.dir = dir
            this.applyDir()

            this.sprite.x = Math.constrain(this.sprite.x, minx, maxx)
            this.sprite.y = Math.constrain(this.sprite.y, miny, maxy)
        }

        setFreeze(freeze: boolean) {
            this.frozen = freeze
            if (freeze) {
                this.fvx = this.sprite.vx
                this.fvy = this.sprite.vy
                this.sprite.vx = 0
                this.sprite.vy = 0
            } else {
                this.sprite.vx = this.fvx
                this.sprite.vy = this.fvy
            }
            this.images.setFreeze(freeze)
        }

        isReady(): boolean {
            return (this.sprite && this.visible && !this.frozen)
        }

        isStopped(): boolean {
            return (this.sprite.vx == 0 && this.sprite.vy == 0)
        }

        isDirectionValid(dir: Direction): boolean {
            return (this.validDirs & dir) != 0
        }

        setImages(images: DirImage) {
            if (this.images != images) {
                if (this.images) {
                    this.images.setFreeze(true)
                }
                this.images = images
                this.sprite.setImage(images.img)
                this.images.apply(this.sprite, this.dir)
            }
        }

        private checkTile(dir: Direction) {
            const next = this.tile.getNext(dir)
            if (map.getFlag(next, MapFlags.Maze)) {
                this.validDirs |= dir
            }
        }
    }
}
