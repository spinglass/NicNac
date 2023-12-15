namespace maze {
    export class Fruit {
        maze: Maze
        sprite: Sprite
        visible: boolean
        pillCount: number
        pillSpawns: number[]
        despawnTime: number

        constructor() {
        }

        init() {
            this.maze = getMaze()
            this.sprite = sprites.create(assets.image`fruit`)
            this.setVisible(false)
        }

        initLevel() {
            this.pillCount = 0
            this.pillSpawns = [70, 170]
            this.despawnTime = 10

            this.setVisible(false)
            this.sprite.x = this.maze.map.fruitX
            this.sprite.y = this.maze.map.fruitY

            this.maze.events.register(Event.Pill, () => this.pill())
            this.maze.events.register(Event.Fruit, () => this.setVisible(false))
            this.maze.events.register(Event.FruitDespawn, () => this.setVisible(false))
        }

        private setVisible(visible: boolean) {
            this.visible = visible
            this.sprite.setFlag(SpriteFlag.Ghost, !visible)
            this.sprite.setFlag(SpriteFlag.Invisible, !visible)
        }

        private pill() {
            ++this.pillCount

            if (this.pillSpawns.find(x => (x == this.pillCount))) {
                this.setVisible(true)
                
                this.maze.events.fire(Event.FruitSpawn)
                this.maze.events.fireLater(Event.FruitDespawn, this.despawnTime)
            }
        }

        update() {
            if (this.visible) {
                const dx = Math.abs(this.maze.hero.mover.x - this.sprite.x)
                const dy = Math.abs(this.maze.hero.mover.y - this.sprite.y)

                if (dx < 8 && dy < 8) {
                    this.maze.events.cancel(Event.FruitDespawn)
                    this.maze.events.fire(Event.Fruit)
                    this.setVisible(false)
                }
            }
        }
    }
}