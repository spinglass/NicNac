namespace maze {
    export class Fruit {
        sprite: Sprite
        visible: boolean
        count: number           // total fruit eaten
        fruitNames: string[]

        constructor() {
        }

        init() {
            this.fruitNames = [
                "fruit_cherries",
                "fruit_strawberry",
                "fruit_lemon",
                "fruit_apple",
                "fruit_pizza",
                "fruit_cake"
                ]
            const img = helpers.getImageByName(this.fruitNames[0])
            this.sprite = sprites.create(img)
            this.setVisible(false)
            this.count = 0
        }

        initLevel(levelIndex: number) {
            this.setVisible(false)
            this.sprite.x = map.fruit.x
            this.sprite.y = map.fruit.y

            const i = (levelIndex % this.fruitNames.length)
            const img = helpers.getImageByName(this.fruitNames[i])
            this.sprite.setImage(img)

            events.register(Event.EatFruit, () => this.setVisible(false))
            events.register(Event.FruitDespawn, () => this.setVisible(false))
        }

        resetLevel() {
            // if fruit was spawned, the despawn event is cancelled at the restart
            // so re-fire the event with a new time
            events.fireLater(Event.FruitDespawn, level.timeFruitDespawn / 2)
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