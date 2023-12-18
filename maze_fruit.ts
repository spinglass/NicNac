namespace maze {
    export class Fruit {
        maze: Maze
        sprite: Sprite
        visible: boolean
        pillCount: number
        count: number           // total fruit eaten

        constructor() {
        }

        init() {
            this.maze = getMaze()
            this.sprite = sprites.create(assets.image`fruit`)
            this.setVisible(false)
            this.count = 0
        }

        initLevel() {
            this.pillCount = 0

            this.setVisible(false)
            this.sprite.x = this.maze.map.fruit.x
            this.sprite.y = this.maze.map.fruit.y

            this.maze.events.register(Event.EatPill, () => this.checkSpawn())
            this.maze.events.register(Event.EatPower, () => this.checkSpawn())
            this.maze.events.register(Event.EatFruit, () => this.setVisible(false))
            this.maze.events.register(Event.FruitDespawn, () => this.setVisible(false))
        }

        private setVisible(visible: boolean) {
            this.visible = visible
            this.sprite.setFlag(SpriteFlag.Ghost, !visible)
            this.sprite.setFlag(SpriteFlag.Invisible, !visible)
        }

        private checkSpawn() {
            ++this.pillCount

            if (level.fruitSpawns.find(x => (x == this.pillCount))) {
                this.setVisible(true)
                
                this.maze.events.fire(Event.FruitSpawn)
                this.maze.events.fireLater(Event.FruitDespawn, level.timeFruitDespawn)
            }
        }

        update() {
            if (this.visible) {
                const dx = Math.abs(this.maze.hero.mover.x - this.sprite.x)
                const dy = Math.abs(this.maze.hero.mover.y - this.sprite.y)

                if (dx < 8 && dy < 8) {
                    ++this.count
                    this.maze.events.cancel(Event.FruitDespawn)
                    this.maze.events.fire(Event.EatFruit)
                    this.setVisible(false)
                }
            }
        }
    }
}