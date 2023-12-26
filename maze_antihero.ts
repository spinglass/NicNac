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

            // Eat noms
            for (const nom of noms) {
                if (nom.active) {
                    const dx = Math.abs(nom.mover.x - this.mover.x)
                    const dy = Math.abs(nom.mover.y - this.mover.y)
                    if (dx < 4 && dy < 4) {
                        events.fire(Event.EatChaser)

                        // hide the nom
                        nom.setEaten()

                        // also only one per frame, so both score events are seen
                        break
                    }
                }
            }
        }
    }
}
