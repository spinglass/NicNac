namespace maze {
    export class Game {
        maze: Maze
        scorePill: number
        scorePower: number
        pillsRemaining: number
        levelComplete: boolean

        constructor() {
            this.scorePill = 10
            this.scorePower = 200
            this.pillsRemaining = 0
            this.levelComplete = false
        }

        init() {
            this.maze = getMaze()

            info.setScore(0)

            // register for events
            this.maze.events.register(Event.Pill, () => this.score(Event.Pill))
            this.maze.events.register(Event.Power, () => this.score(Event.Power))
            this.maze.events.register(Event.NextLevel, () => this.nextLevel())
        }

        initLevel() {
            this.pillsRemaining = this.maze.map.pillCount
            this.levelComplete = false
        }

        private score(event: Event) {
            // score events
            let s = 0
            if (event == Event.Pill) {
                s = this.scorePill
            } else if (event == Event.Power) {
                s = this.scorePower
            }
            info.changeScoreBy(s)

            // check for completing the level
            if (!this.levelComplete) {
                if (event == Event.Pill || event == Event.Power) {
                    --this.pillsRemaining

                    if (this.pillsRemaining <= 0) {
                        this.levelComplete = true
                        this.setFreeze(true)
                        this.maze.events.fire(Event.LevelComplete)
                        this.maze.events.fireLater(Event.NextLevel, 1)
                    }
                }
            }
        }

        private nextLevel() {
            // TEMP - complete game
            this.maze.events.fire(Event.GameComplete)
            game.gameOver(true)
        }

        private setFreeze(freeze: boolean) {
            this.maze.hero.mover.setFreeze(freeze)
        }
    }
}
