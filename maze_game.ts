namespace maze {
    export enum Difficulty {
        None,
        Easy,
        Hard,
    }
    export function difficultyString(diff: Difficulty) {
        switch (diff) {
            case Difficulty.None: return "None"
            case Difficulty.Easy: return "Easy"
            case Difficulty.Hard: return "Hard"
        }
        return null
    }

    export class Game {
        maze: Maze
        pillsEaten: number
        pillsRemaining: number
        levelComplete: boolean
        chaserMode: ChaserMode
        chaserEatCount: number
        chaserWarn: boolean
        difficulty: Difficulty
        levelCount: number
        freeze: boolean

        constructor() {
        }

        init() {
            this.maze = getMaze()
            this.pillsRemaining = 0
            this.pillsEaten = 0
            this.levelComplete = false
            this.difficulty = Difficulty.None
            this.levelCount = 0
            this.freeze = true

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
            this.maze.events.register(Event.ChaserEndMode, () => this.chaserEndMode())
            this.maze.events.register(Event.ChaserWarn, () => this.chaserSetWarn())
        }

        bootFlow() {
            const result = ask("Welcome to NicNac", "Select difficulty", "A = Easy, B = Hard")
            this.difficulty = result ? Difficulty.Easy : Difficulty.Hard

            // get high-score for difficulty
            const diff = difficultyString(this.difficulty)
            let highScore = settings.readNumber("high_score_" + diff)
            if (!highScore) {
                highScore = 0
            }
            settings.writeNumber("high_score", highScore)

            info.setScore(0)
            info.setLife(level.lives)

            show("You chose: " + diff, "High score: " + highScore, " ", 2)

            level.init()
        }

        initLevel() {
            scene.cameraFollowSprite(this.maze.hero.mover.sprite)

            level.initLevel(this.levelCount)

            this.pillsEaten = 0
            this.pillsRemaining = this.maze.map.pillCount
            this.levelComplete = false
            this.chaserEatCount = 0
            this.chaserWarn = false

            this.maze.map.initLevel()
            this.maze.hero.initLevel()
            for (const chaser of this.maze.chasers) {
                chaser.initLevel()
            }
            this.maze.fruit.initLevel()

            this.maze.events.cancelAll()
            this.maze.events.fireLater(Event.LevelStart, 0)
        }

        private pause(time: number) {
            this.setFreeze(true)
            this.maze.events.fireLater(Event.Defrost, time)
        }

        private eat(event: Event) {
            // eat events
            let s = 0
            if (event == Event.EatPill) {
                s = level.scorePill
            } else if (event == Event.EatPower) {
                s = level.scorePower
            } else if (event == Event.EatFruit) {
                const i = Math.min(this.maze.fruit.count - 1, level.scoreFruit.length - 1)
                s = level.scoreFruit[i]
                this.maze.hero.mover.sprite.say(s, 1000)
            } else if (event == Event.EatChaser) {
                s = level.scoreChaser[this.chaserEatCount++]

                // pause to enjoy the taste
                this.maze.hero.mover.sprite.say(s, 1000)
                this.pause(1)
            }
            info.changeScoreBy(s)

            // check for completing the level
            if (!this.levelComplete && (event == Event.EatPill || event == Event.EatPower)) {
                ++this.pillsEaten
                --this.pillsRemaining

                if (this.pillsRemaining <= 0) {
                    this.levelComplete = true
                    this.setFreeze(true)
                    this.maze.events.fire(Event.LevelComplete)
                    this.maze.events.fireLater(Event.LevelNext, 1)
                } else {
                    this.updateRelease()
                }
            }

            if (!this.levelComplete && event == Event.EatPower) {
                this.chaserEatCount = 0
                this.setChaserMode(ChaserMode.Fright)
                this.maze.events.fireLater(Event.ChaserEndMode, level.timeFright)
                this.maze.events.fireLater(Event.ChaserWarn, level.timeWarn)
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

        private chaserEndMode() {
            this.maze.events.cancel(Event.ChaserWarn)
            
            switch (this.chaserMode) {
                case ChaserMode.Scatter:
                case ChaserMode.Fright:
                    this.setChaserMode(ChaserMode.Chase)
                    this.maze.events.fireLater(Event.ChaserEndMode, level.timeChase)
                    break
                case ChaserMode.Chase:
                    this.setChaserMode(ChaserMode.Scatter)
                    this.maze.events.fireLater(Event.ChaserEndMode, level.timeScatter)
                    break
            }
            this.chaserEatCount = 0
        }

        private chaserSetWarn() {
            this.chaserWarn = !this.chaserWarn
            for (const chaser of this.maze.chasers) {
                chaser.setWarn(this.chaserWarn)
            }

            // resend to flash the warning
            this.maze.events.fireLater(Event.ChaserWarn, level.timeWarnFlash)
        }

        private saveHighScore() {
            // check the high score for the difficulty
            const diff = "high_score_" + difficultyString(this.difficulty)
            const highScore = settings.readNumber(diff)
            const score = info.score()
            if (!highScore || score > highScore) {
                settings.writeNumber(diff, score)
            }
        }

        private gameOver() {
            this.saveHighScore()
            game.setGameOverEffect(false, effects.dissolve)
            game.gameOver(false)
        }

        private levelStart() {
            // set mode
            this.setChaserMode(ChaserMode.Scatter)
            this.maze.events.fireLater(Event.ChaserEndMode, level.timeScatter)
            this.chaserEatCount = 0

            this.maze.hero.place()
            for (let i = 0; i < this.maze.chasers.length; ++i) {
                const chaser = this.maze.chasers[i]
                chaser.place()
            }
            this.updateRelease()
            this.pause(1.5)
        }

        private levelNext() {
            ++this.levelCount;
            this.initLevel()       
        }

        private updateRelease() {
            for (let i = 0; i < this.maze.chasers.length; ++i) {
                if (level.pillReleaseCount[i] == this.pillsEaten) {
                    this.maze.chasers[i].setRelease()
                }
            }
        }

        private setFreeze(freeze: boolean) {
            this.freeze = freeze
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

        update() {
            if (this.freeze) {
                return
            }

            if (controller.A.isPressed() || controller.B.isPressed()) {
                ask("NicNac", "Game paused", "Press A to continue")
                this.pause(1.0)
            }
        }
    }
}
