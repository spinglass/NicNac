namespace maze {
    export class Fruit {
        sprite: Sprite
        visible: boolean
        count: number           // total fruit eaten

        constructor() {
        }

        init() {
            this.sprite = sprites.create(assets.image`fruit`)
            this.setVisible(false)
            this.count = 0
        }

        initLevel() {
            this.setVisible(false)
            this.sprite.x = map.fruit.x
            this.sprite.y = map.fruit.y

            events.register(Event.EatFruit, () => this.setVisible(false))
            events.register(Event.FruitDespawn, () => this.setVisible(false))
        }

        private setVisible(visible: boolean) {
            this.visible = visible
            this.sprite.setFlag(SpriteFlag.Ghost, !visible)
            this.sprite.setFlag(SpriteFlag.Invisible, !visible)
        }

        checkSpawn(pillCount: number) {
            if (level.fruitSpawns.find(x => (x == pillCount))) {
                this.setVisible(true)
                
                events.fire(Event.FruitSpawn)
                events.fireLater(Event.FruitDespawn, level.timeFruitDespawn)
            }
        }

        update() {
            if (this.visible) {
                const dx = Math.abs(hero.mover.x - this.sprite.x)
                const dy = Math.abs(hero.mover.y - this.sprite.y)

                if (dx < 8 && dy < 8) {
                    ++this.count
                    events.cancel(Event.FruitDespawn)
                    events.fire(Event.EatFruit)
                    this.setVisible(false)
                }
            }
        }
    }
}