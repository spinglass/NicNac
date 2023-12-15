namespace maze {
    export class Hero {
        mover: Mover

        constructor() {
            this.mover = new Mover()
        }

        init(img: Image) {
            this.mover.init(img)
            scene.cameraFollowSprite(this.mover.sprite)
        }

        initLevel() {
            const map = getMaze().map
            this.mover.hx = map.homeX
            this.mover.hy = map.homeY
            this.place()
        }

        place() {
            this.mover.place()
        }

        update() {
            if (controller.up.isPressed()) {
                this.mover.request = Direction.Up
            } else if (controller.down.isPressed()) {
                this.mover.request = Direction.Down
            } else if (controller.left.isPressed()) {
                this.mover.request = Direction.Left
            } else if (controller.right.isPressed()) {
                this.mover.request = Direction.Right
            }


            this.mover.update()
        }
    }
}
