namespace maze {
    const scorePill = 10
    const scorePower = 50
    const scoreFruit = [200, 400, 600, 800, 1000]
    const scoreChaser = [100, 200, 400, 800]
    const timeScatter = 7
    const timeChase = 20
    const timeFrightened = 7
    const timeWait = [0, 0, 20, 40]

    export class Game {
        maze: Maze
        pillsRemaining: number
        levelComplete: boolean
        chaserMode: ChaserMode
        chaserEatCount: number

        constructor() {
            this.pillsRemaining = 0
            this.levelComplete = false
        }

        init() {
            this.maze = getMaze()

            info.setScore(0)
            info.setLife(3)

            // register for events
            this.maze.events.register(Event.EatPill, () => this.eat(Event.EatPill))
            this.maze.events.register(Event.EatPower, () => this.eat(Event.EatPower))
            this.maze.events.register(Event.EatFruit, () => this.eat(Event.EatFruit))
            this.maze.events.register(Event.EatChaser, () => this.eat(Event.EatChaser))
            this.maze.events.register(Event.LevelStart, () => this.levelStart())
            this.maze.events.register(Event.LevelNext, () => this.levelNext())
            this.maze.events.register(Event.Defrost, () => this.setFreeze(false))
            this.maze.events.register(Event.LoseLife, () => this.life())
            this.maze.events.register(Event.GameOver, () => this.gameOver())
            this.maze.events.register(Event.ChaserEndMode, () => this.endChaserMode())
        }

        initLevel() {
            scene.cameraFollowSprite(this.maze.hero.mover.sprite)
            //const base = this.maze.map.returnBase
            //scene.centerCameraAt(base.cx, base.cy)

            this.pillsRemaining = this.maze.map.pillCount
            this.levelComplete = false
            this.chaserEatCount = 0
        }

        private pause(time: number) {
            this.setFreeze(true)
            this.maze.events.fireLater(Event.Defrost, time)
        }

        private eat(event: Event) {
            // eat events
            let s = 0
            if (event == Event.EatPill) {
                s = scorePill
            } else if (event == Event.EatPower) {
                s = scorePower
            } else if (event == Event.EatFruit) {
                const i = Math.min(this.maze.fruit.count - 1, scoreFruit.length - 1)
                s = scoreFruit[i]
                this.maze.hero.mover.sprite.say(s, 1000)
            } else if (event == Event.EatChaser) {
                s = scoreChaser[this.chaserEatCount++]

                // pause to enjoy the taste
                this.maze.hero.mover.sprite.say(s, 1000)
                this.pause(1)
            }
            info.changeScoreBy(s)

            // check for completing the level
            if (!this.levelComplete && (event == Event.EatPill || event == Event.EatPower)) {
                --this.pillsRemaining

                if (this.pillsRemaining <= 0) {
                    this.levelComplete = true
                    this.setFreeze(true)
                    this.maze.events.fire(Event.LevelComplete)
                    this.maze.events.fireLater(Event.LevelNext, 1)
                }
            }

            if (!this.levelComplete && event == Event.EatPower) {
                this.setChaserMode(ChaserMode.Frightened)
                this.maze.events.fireLater(Event.ChaserEndMode, timeFrightened)
            }
        }

        private life() {
            // stop everything
            this.setFreeze(true)
            this.maze.events.cancelAll()

            // replace the game-over handler so we can slightly delay it
            info.onLifeZero(() => { })
            info.changeLifeBy(-1)

            if (info.life() <= 0) {
                this.maze.events.fireLater(Event.GameOver, 1.5)
            } else {
                // brief pause before restarting
                this.maze.events.fireLater(Event.LevelStart, 1.5)
            }
        }

        private endChaserMode() {
            switch (this.chaserMode) {
                case ChaserMode.Scatter:
                case ChaserMode.Frightened:
                    this.setChaserMode(ChaserMode.Chase)
                    this.maze.events.fireLater(Event.ChaserEndMode, timeChase)
                    break
                case ChaserMode.Chase:
                    this.setChaserMode(ChaserMode.Scatter)
                    this.maze.events.fireLater(Event.ChaserEndMode, timeScatter)
                    break
            }
            this.chaserEatCount = 0
        }

        private gameOver() {
            game.setGameOverEffect(false, effects.dissolve)
            game.gameOver(false)
        }

        private levelStart() {
            // set mode
            this.setChaserMode(ChaserMode.Scatter)
            this.maze.events.fireLater(Event.ChaserEndMode, timeScatter)

            this.maze.hero.place()
            for (let i = 0; i < this.maze.chasers.length; ++i) {
                const chaser = this.maze.chasers[i]
                chaser.setWait(timeWait[i])
                chaser.place()
            }
            this.pause(1.5)
        }

        private levelNext() {
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

        private setChaserMode(mode: ChaserMode) {
            this.chaserMode = mode
            for (const chaser of this.maze.chasers) {
                chaser.setMode(mode)
            }
        }
    }
}
