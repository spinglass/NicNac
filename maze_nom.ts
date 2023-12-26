namespace maze {
    export class Nom {
        mover: Mover
        img: DirImage
        id: number
        active: boolean

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
        }

        setEaten() {
            this.active = false
            this.mover.setVisible(false)
        }
    }
}