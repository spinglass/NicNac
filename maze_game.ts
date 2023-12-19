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
            this.pillsRemaining = 0
            this.pillsEaten = 0
            this.levelComplete = false
            this.difficulty = Difficulty.None
            this.levelCount = 0
            this.freeze = true

            // register for events
            events.register(Event.EatPill, () => this.eat(Event.EatPill))
            events.register(Event.EatPower, () => this.eat(Event.EatPower))
            events.register(Event.EatFruit, () => this.eat(Event.EatFruit))
            events.register(Event.EatChaser, () => this.eat(Event.EatChaser))
            events.register(Event.LevelStart, () => this.levelStart())
            events.register(Event.LevelNext, () => this.levelNext())
            events.register(Event.Defrost, () => this.setFreeze(false))
            events.register(Event.DefrostHero, () => this.defrostHero())
            events.register(Event.LoseLife, () => this.life())
            events.register(Event.GameOver, () => this.gameOver())
            events.register(Event.ChaserEndMode, () => this.chaserEndMode())
            events.register(Event.ChaserWarn, () => this.chaserSetWarn())
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

            level.initLevel(this.difficulty, 0)
            info.setScore(0)
            info.setLife(level.lives)

            show("You chose: " + diff, "High score: " + highScore, " ", 2)
        }

        initLevel() {
            scene.cameraFollowSprite(hero.mover.sprite)

            level.initLevel(this.difficulty, this.levelCount)

            this.pillsEaten = 0
            this.pillsRemaining = map.pillCount
            this.levelComplete = false
            this.chaserEatCount = 0
            this.chaserWarn = false

            map.initLevel()
            hero.initLevel()
            for (const chaser of chasers) {
                chaser.initLevel()
            }
            fruit.initLevel()

            events.cancelAll()
            events.fireLater(Event.LevelStart, 0)
        }

        private pause(time: number) {
            this.setFreeze(true)
            events.fireLater(Event.Defrost, time)
        }

        private freezeHero(time: number) {
            hero.mover.setFreeze(true, false)
            events.fireLater(Event.DefrostHero, time)
        }

        private defrostHero() {
            if (!this.freeze) {
                hero.mover.setFreeze(false)
            }
        }

        private eat(event: Event) {
            // eat events
            let s = 0
            if (event == Event.EatPill) {
                s = level.scorePill
                this.freezeHero(1 / 60)
            } else if (event == Event.EatPower) {
                s = level.scorePower
                this.freezeHero(1 / 30)
            } else if (event == Event.EatFruit) {
                const i = Math.min(fruit.count - 1, level.scoreFruit.length - 1)
                s = level.scoreFruit[i]
                hero.mover.sprite.say(s, 1000)
            } else if (event == Event.EatChaser) {
                s = level.scoreChaser[this.chaserEatCount++]

                // pause to enjoy the taste
                hero.mover.sprite.say(s, 1000)
                this.pause(1)
            }
            info.changeScoreBy(s)

            // check for completing the level
            if (!this.levelComplete && (event == Event.EatPill || event == Event.EatPower)) {
                ++this.pillsEaten
                --this.pillsRemaining

                fruit.checkSpawn(this.pillsEaten)

                if (this.pillsRemaining <= 0) {
                    this.levelComplete = true
                    this.setFreeze(true)
                    events.fire(Event.LevelComplete)
                    events.fireLater(Event.LevelNext, 1)
                } else {
                    this.updateRelease()
                }
            }

            if (!this.levelComplete && event == Event.EatPower) {
                this.chaserEatCount = 0
                this.setChaserMode(ChaserMode.Fright)
                events.fireLater(Event.ChaserEndMode, level.timeFright)
                events.fireLater(Event.ChaserWarn, level.timeWarn)
            }
        }

        private life() {
            // stop everything
            this.setFreeze(true)
            events.cancelAll()

            // replace the game-over handler so we can slightly delay it
            info.onLifeZero(() => { })
            info.changeLifeBy(-1)

            if (info.life() <= 0) {
                events.fireLater(Event.GameOver, 1.5)
            } else {
                // brief pause before restarting
                events.fireLater(Event.LevelStart, 1.5)
            }
        }

        private chaserEndMode() {
            events.cancel(Event.ChaserWarn)
            
            switch (this.chaserMode) {
                case ChaserMode.Scatter:
                case ChaserMode.Fright:
                    this.setChaserMode(ChaserMode.Chase)
                    events.fireLater(Event.ChaserEndMode, level.timeChase)
                    break
                case ChaserMode.Chase:
                    this.setChaserMode(ChaserMode.Scatter)
                    events.fireLater(Event.ChaserEndMode, level.timeScatter)
                    break
            }
            this.chaserEatCount = 0
        }

        private chaserSetWarn() {
            this.chaserWarn = !this.chaserWarn
            for (const chaser of chasers) {
                chaser.setWarn(this.chaserWarn)
            }

            // resend to flash the warning
            events.fireLater(Event.ChaserWarn, level.timeWarnFlash)
        }

        private saveHighScore(): boolean {
            // check the high score for the difficulty
            const diff = "high_score_" + difficultyString(this.difficulty)
            const highScore = settings.readNumber(diff)
            const score = info.score()
            if (!highScore || score > highScore) {
                settings.writeNumber(diff, score)
                return true
            }
            return false
        }

        private gameOver() {
            if (this.saveHighScore()) {
                game.setGameOverEffect(false, effects.confetti)
                game.gameOver(true)
            } else {
                game.setGameOverEffect(false, effects.dissolve)
                game.gameOver(false)
            }
        }

        private levelStart() {
            // set mode
            this.setChaserMode(ChaserMode.Scatter)
            events.fireLater(Event.ChaserEndMode, level.timeScatter)
            this.chaserEatCount = 0

            hero.place()
            for (let i = 0; i < chasers.length; ++i) {
                const chaser = chasers[i]
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
            for (let i = 0; i < chasers.length; ++i) {
                if (level.pillReleaseCount[i] == this.pillsEaten) {
                    chasers[i].setRelease()
                }
            }
        }

        private setFreeze(freeze: boolean) {
            this.freeze = freeze
            hero.mover.setFreeze(freeze)
            for (const chaser of chasers) {
                chaser.mover.setFreeze(freeze)
            }
        }

        private setChaserMode(mode: ChaserMode) {
            this.chaserMode = mode
            hero.chaserMode = mode
            for (const chaser of chasers) {
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
