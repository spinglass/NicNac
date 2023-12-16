namespace maze {
    class DirImage {
        dir: Direction
        img: Image

        constructor(name: string, dir: Direction) {
            let imgName = name + "_" + dirString(dir)
            this.img = helpers.getImageByName(imgName)
            this.dir = dir
        }
    }

    export class Mover {
        maze: Maze
        sprite: Sprite
        images: DirImage[]
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
        mapType: MapFlags

        constructor() {
            this.images = []
            this.x = 0
            this.y = 0
            this.tile = new Tile(0, 0)
            this.validDirs = 0
            this.dir = Direction.None
            this.request = Direction.None
            this.speed = 80
            this.visible = false
            this.frozen = false
            this.fvx = 0
            this.fvy = 0
            this.changedTile = false
            this.mapType = MapFlags.None
        }

        init(name: string) {
            this.maze = getMaze()            

            this.images = [
                new DirImage(name, Direction.None),
                new DirImage(name, Direction.Up),
                new DirImage(name, Direction.Down),
                new DirImage(name, Direction.Left),
                new DirImage(name, Direction.Right),
                ]
            this.sprite = sprites.create(this.images[0].img)
            this.setImage(Direction.Right)

            // Hide until placed
            this.setVisible(false)
        }
        
        private updateState() {
            // get tile coords
            this.x = this.sprite.x
            this.y = this.sprite.y
            this.tile = getTileFromWorldPosition(this.x, this.y)

            // check which directions can travel from this tile
            this.validDirs = 0
            this.checkTile(Direction.Up)
            this.checkTile(Direction.Right)
            this.checkTile(Direction.Down)
            this.checkTile(Direction.Left)
        }

        private setImage(dir: Direction) {
            for (const img of this.images) {
                if (img.dir == dir) {
                    this.sprite.setImage(img.img)
                    break
                }
            }
        }

        reset() {
            this.setVisible(false)
        }

        place() {
            this.sprite.x = this.hx
            this.sprite.y = this.hy
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

            // get previous state
            const px = this.x
            const py = this.y
            const ptile = this.tile

            this.updateState()

            // ignore if request is same as current direction
            if (this.request == this.dir) {
                this.request = Direction.None
            }

            this.changedTile = (this.tile.tx != ptile.tx) || (this.tile.ty != ptile.ty)
            if (this.changedTile) {
                // check for tunnel
                const exit = this.maze.map.useTunnel(this.tile)
                if (exit) {
                    // keep current speed and warp to exit
                    this.sprite.x = exit.cx
                    this.sprite.y = exit.cy
                    this.updateState()
                    return
                }
            }
            
            const stopped = (this.sprite.vx == 0 && this.sprite.vy == 0)

            let crossing = false
            const cx = this.tile.cx
            const cy = this.tile.cy
            if (!stopped) {
                // Check for crossing centre of tile
                if (this.dir == Direction.Up) {
                    crossing = (py > cy && cy >= this.y)
                } else if (this.dir == Direction.Down) {
                    crossing = (py < cy && cy <= this.y)
                } else if (this.dir == Direction.Left) {
                    crossing = (px > cx && cx >= this.x)
                } else if (this.dir == Direction.Right) {
                    crossing = (px < cx && cx <= this.x)
                }

                if (crossing && !this.isDirectionValid(this.dir)) {
                    // cannot continue this direction, clamp position
                    this.sprite.x = this.tile.cx
                    this.sprite.y = this.tile.cy
                }
            }

            if (this.dir != Direction.None) {
                // Can reverse direction at any time
                if (this.dir == opposite(this.request)) {
                    this.dir = this.request
                    this.request = Direction.None
                }
                // Stop current direction if reached tile centre and can't continue
                else if ((stopped || crossing) && !this.isDirectionValid(this.dir)) {
                    this.dir = Direction.None
                }
            }

            // Apply requested direction if it's possible
            if ((stopped || crossing) && this.isDirectionValid(this.request)) {
                this.dir = this.request
                this.request = Direction.None
            }

            // apply to sprite
            switch (this.dir) {
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

            this.setImage(this.dir)
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
        }

        isReady(): boolean {
            return (this.sprite && this.visible && !this.frozen)
        }

        isDirectionValid(dir: Direction): boolean {
            return (this.validDirs & dir) != 0
        }

        private checkTile(dir: Direction) {
            const next = this.tile.getNext(dir)
            if (this.maze.map.getFlag(next, this.mapType)) {
                this.validDirs |= dir
            }
        }
    }
}
