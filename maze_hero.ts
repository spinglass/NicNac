namespace maze {
    export class Hero {
        sprite: Sprite
        speed: number
        homeX: number
        homeY: number

        constructor() {
            this.speed = 100
            this.homeX = 0
            this.homeY = 0
        }

        init(img: Image) {
            this.sprite = sprites.create(img, SpriteKind.Player)
            scene.cameraFollowSprite(this.sprite)
        }

        initLevel() {
            // Find home
            this.homeX = 0
            this.homeY = 0;
            const locs = tiles.getTilesByType(assets.tile`tile_hero`)
            if (locs.length > 0) {
                for (const loc of locs) {
                    this.homeX += loc.x
                    this.homeY += loc.y
                }
                this.homeX /= locs.length
                this.homeY /= locs.length
            }
            console.log("Hero home: (" + this.homeX + ", " + this.homeY + ")")
            this.placeHome()
        }

        placeHome() {
            this.sprite.x = this.homeX
            this.sprite.y = this.homeY
            this.sprite.vx = 0
            this.sprite.vy = 0
        }

        update() {
            if (controller.up.isPressed()) {
                this.sprite.vx = 0
                this.sprite.vy = -this.speed
            } else if (controller.down.isPressed()) {
                this.sprite.vx = 0
                this.sprite.vy = this.speed
            } else if (controller.left.isPressed()) {
                this.sprite.vx = -this.speed
                this.sprite.vy = 0
            } else if (controller.right.isPressed()) {
                this.sprite.vx = this.speed
                this.sprite.vy = 0
            } else {
                this.sprite.vx = 0
                this.sprite.vy = 0
            }
        }
    }
}
