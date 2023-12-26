namespace maze {
    export class AntiHero {
        mover: Mover
        images: DirImage

        constructor() {
            this.mover = new Mover()
            this.images = new DirImage()
        }

        init() {
            this.images.load("chaser0")
            this.mover.init(this.images)
            this.mover.fastTurn = true
        }

        initLevel() {
            this.mover.hx = map.home.x
            this.mover.hy = map.home.y
            this.mover.place()
        }

        resetLevel() {
            this.mover.place()
            this.mover.setImage()
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

            this.mover.speed = level.speedHero
            this.mover.update()
            this.mover.setImage()
        }
    }
}
