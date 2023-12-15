namespace maze {
    export class Game {
        maze: Maze
        scorePill: number
        scorePower: number
        pillsRemaining: number

        constructor() {
            this.scorePill = 10
            this.scorePower = 200
            this.pillsRemaining = 0
        }

        init() {
            this.maze = getMaze()

            info.setScore(0)

            // register for events
            this.maze.events.register(Event.Pill, () => this.handle(Event.Pill))
            this.maze.events.register(Event.Power, () => this.handle(Event.Power))
        }

        initLevel() {
            this.pillsRemaining = this.maze.map.pillCount
        }

        private handle(event: Event) {
            // score events
            let s = 0
            if (event == Event.Pill) {
                s = this.scorePill
            } else if (event == Event.Power) {
                s = this.scorePower
            }
            info.changeScoreBy(s)

            // check for completing the level
            if (event == Event.Pill || event == Event.Power) {
                --this.pillsRemaining

                if (this.pillsRemaining <= 0) {
                    this.maze.hero.mover.setFreeze(true)
                    this.maze.events.fire(Event.LevelComplete)

                    // TEMP - complete game
                    game.gameOver(true)
                }
            }
        }
    }
}
