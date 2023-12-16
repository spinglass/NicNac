namespace maze {
    export class Game {
        maze: Maze
        scorePill: number
        scorePower: number
        scoreFruit: number
        pillsRemaining: number
        levelComplete: boolean

        constructor() {
            this.scorePill = 10
            this.scorePower = 50
            this.scoreFruit = 200
            this.pillsRemaining = 0
            this.levelComplete = false
        }

        init() {
            this.maze = getMaze()

            info.setScore(0)
            info.setLife(3)

            // register for events
            this.maze.events.register(Event.Pill, () => this.score(Event.Pill))
            this.maze.events.register(Event.Power, () => this.score(Event.Power))
            this.maze.events.register(Event.Fruit, () => this.score(Event.Fruit))
            this.maze.events.register(Event.StartLevel, () => this.startLevel())
            this.maze.events.register(Event.NextLevel, () => this.nextLevel())
            this.maze.events.register(Event.Defrost, () => this.setFreeze(false))
            this.maze.events.register(Event.LoseLife, () => this.life())
        }

        initLevel() {
            this.pillsRemaining = this.maze.map.pillCount
            this.levelComplete = false
            this.startLevel()
        }

        private pause(time: number) {
            this.setFreeze(true)
            this.maze.events.fireLater(Event.Defrost, time)
        }

        private score(event: Event) {
            // score events
            let s = 0
            if (event == Event.Pill) {
                s = this.scorePill
            } else if (event == Event.Power) {
                s = this.scorePower
            } else if (event == Event.Fruit) {
                s = this.scoreFruit
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

        private life() {
            // replace the game-over handler so we can slightly delay it
            info.onLifeZero(() => { })
            info.changeLifeBy(-1)

            this.setFreeze(true)
            this.maze.events.fireLater(Event.StartLevel, 1.5)
        }

        private startLevel() {
            if (info.life() <= 0) {
                // all done
                game.setGameOverEffect(false, effects.dissolve)
                game.gameOver(false)
            } else {
                this.maze.hero.mover.place()
                for (const chaser of this.maze.chasers) {
                    chaser.mover.place()
                }
                this.pause(1.5)
            }
        }

        private nextLevel() {
            // TEMP - complete game
            this.maze.events.fire(Event.GameComplete)
            game.gameOver(true)
        }

        private setFreeze(freeze: boolean) {
            this.maze.hero.mover.setFreeze(freeze)
            for (const chaser of this.maze.chasers) {
                chaser.mover.setFreeze(freeze)
            }
        }
    }
}
