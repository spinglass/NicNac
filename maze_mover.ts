namespace maze {
    export class DirImage {
        img: Image
        anim: Image[]
        animUp: Image[]
        animDown: Image[]
        animLeft: Image[]
        animRight: Image[]
        dir: Direction
        sprite: Sprite

        constructor() {
            this.dir = Direction.None
        }

        private loadAnim(name: string): Image[] {
            let images: Image[] = []
            for (let i = 0; i < 32; ++i) {
                const img: Image = helpers.getImageByName(name + i)
                if (img) {
                    images.push(img)
                } else {
                    break
                }
            }
            console.log(name + ":" + images.length)
            return (images.length > 0) ? images : null
        }

        private getAnim(dir: Direction): Image[] {
            switch (dir) {
                case Direction.Up: return (this.animUp ? this.animUp : this.anim)
                case Direction.Down: return (this.animDown ? this.animDown : this.anim)
                case Direction.Left: return (this.animLeft ? this.animLeft : this.anim)
                case Direction.Right: return (this.animRight ? this.animRight : this.anim)
            }
            return this.anim
        }

        load(name: string) {
            this.img = helpers.getImageByName(name)
            this.anim = this.loadAnim(name)
            this.animUp = this.loadAnim(name + "_up")
            this.animDown = this.loadAnim(name + "_down")
            this.animLeft = this.loadAnim(name + "_left")
            this.animRight = this.loadAnim(name + "_right")
        }
        
        apply(sprite: Sprite, dir: Direction) {
            this.sprite = sprite

            if (dir != this.dir) {
                animation.stopAnimation(animation.AnimationTypes.ImageAnimation, this.sprite)

                const anim = this.getAnim(dir)
                if (anim) {
                    if (anim.length > 1) {
                        animation.runImageAnimation(this.sprite, anim, 100, true)
                    } else {
                        this.sprite.setImage(anim[0])
                    }
                }
                this.dir = dir
            }
        }

        setFreeze(freeze: boolean) {
            if (this.sprite) {
                if (freeze) {
                    animation.stopAnimation(animation.AnimationTypes.ImageAnimation, this.sprite)
                    this.dir = Direction.None
                }
                else {
                    this.apply(this.sprite, this.dir)
                }
            }
        }
    }

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
            this.crossedTile = false
            const cx = this.tile.cx
            const cy = this.tile.cy
            if (this.dir == Direction.Up) {
                this.crossedTile = (py > cy && cy >= this.y)
            } else if (this.dir == Direction.Down) {
                this.crossedTile = (py < cy && cy <= this.y)
            } else if (this.dir == Direction.Left) {
                this.crossedTile = (px > cx && cx >= this.x)
            } else if (this.dir == Direction.Right) {
                this.crossedTile = (px < cx && cx <= this.x)
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
            switch (this.dir) {
                case Direction.Up:
                case Direction.Down:
                    this.sprite.x = this.tile.cx
                    break
                case Direction.Left:
                case Direction.Right:
                    this.sprite.y = this.tile.cy
                    break
            }
        }

        setImage() {
            this.images.apply(this.sprite, this.dir)
        }

        reset() {
            this.setVisible(false)
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

            // Apply requested direction if it's possible
            if ((stopped || this.crossedTile) && this.isDirectionValid(this.request)) {
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
