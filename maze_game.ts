namespace maze {
    const scorePill = 10
    const scorePower = 50
    const scoreFruit = [200, 400, 600, 800, 1000]
    const timeScatter = 7
    const timeChase = 20

    export class Game {
        maze: Maze
        pillsRemaining: number
        levelComplete: boolean
        chaserMode: ChaserMode

        constructor() {
            this.pillsRemaining = 0
            this.levelComplete = false
        }

        init() {
            this.maze = getMaze()

            info.setScore(0)
            info.setLife(3)

            // register for events
            this.maze.events.register(Event.EatPill, () => this.score(Event.EatPill))
            this.maze.events.register(Event.EatPower, () => this.score(Event.EatPower))
            this.maze.events.register(Event.EatFruit, () => this.score(Event.EatFruit))
            this.maze.events.register(Event.LevelStart, () => this.startLevel())
            this.maze.events.register(Event.LevelNext, () => this.nextLevel())
            this.maze.events.register(Event.Defrost, () => this.setFreeze(false))
            this.maze.events.register(Event.LoseLife, () => this.life())
            this.maze.events.register(Event.ChaserNextMode, () => this.nextChaserMode())
        }

        initLevel() {
            this.pillsRemaining = this.maze.map.pillCount
            this.levelComplete = false
            this.startLevel()

            // set mode
            this.setChaserMode(ChaserMode.Scatter)
            this.maze.events.fireLater(Event.ChaserNextMode, timeScatter)
        }

        private pause(time: number) {
            this.setFreeze(true)
            this.maze.events.fireLater(Event.Defrost, time)
        }

        private score(event: Event) {
            // score events
            let s = 0
            if (event == Event.EatPill) {
                s = scorePill
            } else if (event == Event.EatPower) {
                s = scorePower
            } else if (event == Event.EatFruit) {
                const i = Math.min(this.maze.fruit.count - 1, scoreFruit.length - 1)
                s = scoreFruit[i]
            } else if (event == Event.EatChaser) {

            }
            info.changeScoreBy(s)

            // check for completing the level
            if (!this.levelComplete) {
                if (event == Event.EatPill || event == Event.EatPower) {
                    --this.pillsRemaining

                    if (this.pillsRemaining <= 0) {
                        this.levelComplete = true
                        this.setFreeze(true)
                        this.maze.events.fire(Event.LevelComplete)
                        this.maze.events.fireLater(Event.LevelNext, 1)
                    }
                }
            }
        }

        private life() {
            // replace the game-over handler so we can slightly delay it
            info.onLifeZero(() => { })
            info.changeLifeBy(-1)

            this.setFreeze(true)
            this.maze.events.fireLater(Event.LevelStart, 1.5)
        }

        private nextChaserMode() {
            switch (this.chaserMode) {
                case ChaserMode.Scatter:
                case ChaserMode.Frightened:
                    this.setChaserMode(ChaserMode.Chase)
                    this.maze.events.fireLater(Event.ChaserNextMode, timeChase)
                    break
                case ChaserMode.Chase:
                    this.setChaserMode(ChaserMode.Scatter)
                    this.maze.events.fireLater(Event.ChaserNextMode, timeScatter)
                    break
            }
        }

        private setChaserMode(mode: ChaserMode) {
            this.chaserMode = mode
            for (const chaser of this.maze.chasers) {
                chaser.setMode(mode)
            }
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
