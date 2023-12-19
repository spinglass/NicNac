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
}