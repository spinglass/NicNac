namespace maze {
    export class Nom {
        mover: Mover
        img: DirImage
        id: number

        constructor(id: number) {
            this.mover = new Mover()
            this.img = new DirImage()
            this.id = id
        }

        init() {
            this.img.load("hero")
            this.mover.init(this.img)
        }

        initLevel() {
            this.mover.hx = map.bases[this.id].cx
            this.mover.hy = map.bases[this.id].cy
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
        }
    }
}