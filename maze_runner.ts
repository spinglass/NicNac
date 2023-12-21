namespace maze {
    export class Runner {
        pillsEaten: number
        pillsRemaining: number
        levelComplete: boolean
        chaserMode: ChaserMode
        chaserEatCount: number
        chaserWarn: boolean
        mode: Mode
        levelIndex: number
        freeze: boolean

        constructor() {
        }

        init() {
            this.pillsRemaining = 0
            this.pillsEaten = 0
            this.levelComplete = false
            this.mode = Mode.None
            this.levelIndex = 0
            this.freeze = true

            // register for events
            events.register(Event.EatPill, () => this.eat(Event.EatPill))
            events.register(Event.EatPower, () => this.eat(Event.EatPower))
            events.register(Event.EatFruit, () => this.eat(Event.EatFruit))
            events.register(Event.EatChaser, () => this.eat(Event.EatChaser))
            events.register(Event.LevelStart, () => this.resetLevel())
            events.register(Event.LevelNext, () => this.levelNext())
            events.register(Event.Defrost, () => this.setFreeze(false))
            events.register(Event.DefrostHero, () => this.defrostHero())
            events.register(Event.LoseLife, () => this.life())
            events.register(Event.GameOver, () => this.gameOver())
            events.register(Event.ChaserEndMode, () => this.chaserEndMode())
            events.register(Event.ChaserWarn, () => this.chaserSetWarn())

            game.onUpdate(() => this.update())
        }

        bootFlow() {
            // check for version change
            const version = settings.readNumber("maze_version")
            if (version != level.version) {
                settings.clear()
                settings.writeNumber("maze_version", level.version)
            }

            let defaultMode = settings.readNumber("maze_mode")
            if (!defaultMode) {
                defaultMode = Mode.Easy
            }
            const result = askOptions("Select mode", ["Easy", "Hard", "Mouth-Man"], defaultMode - 1)
            this.mode = result + 1
            settings.writeNumber("maze_mode", this.mode)

            // get high-score for mode
            const modeName = modeString(this.mode)
            let highScore = settings.readNumber("high_score_" + modeName)
            if (!highScore) {
                highScore = 0
            }
            settings.writeNumber("high-score", highScore)

            level.initLevel(this.mode, 0)
            info.setScore(0)
            info.setLife(level.lives)

            showForTime([modeName, "High score: " + highScore], null, 2)

            this.initLevel()
        }

        initLevel() {
            level.initLevel(this.mode, this.levelIndex)
            map.initLevel()
            hero.initLevel()
            for (const chaser of chasers) {
                chaser.initLevel()
            }
            fruit.initLevel(this.levelIndex)

            this.pillsEaten = 0
            this.pillsRemaining = map.pillCount
            this.levelComplete = false
            this.chaserEatCount = 0
            this.chaserWarn = false

            events.cancelAll()
            events.fireLater(Event.LevelStart, 0)

            scene.cameraFollowSprite(hero.mover.sprite)
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
            // check the high score for the mode
            const diff = "high_score_" + modeString(this.mode)
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

        private resetLevel() {
            // set mode
            this.setChaserMode(ChaserMode.Scatter)
            events.fireLater(Event.ChaserEndMode, level.timeScatter)
            this.chaserEatCount = 0

            hero.resetLevel()
            for (let i = 0; i < chasers.length; ++i) {
                const chaser = chasers[i]
                chaser.resetLevel()
            }
            this.updateRelease()
            fruit.resetLevel()

            this.pause(1.5)
        }

        private levelNext() {
            ++this.levelIndex;
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
            // fire any due events
            events.fireTimedEvents()

            if (controller.A.isPressed() || controller.B.isPressed()) {
                this.setFreeze(true)
                events.fireLater(Event.LevelNext, 1)
                //show("Game paused")
                //this.pause(1.0)
            }
            
            if (this.freeze) {
                // frozen, don't update anything else
                return
            }

            // update game elements
            hero.update()
            for (const chaser of chasers) {
                chaser.update()
            }
            fruit.update()

            // finally fire frame events
            events.fireFrameEvents()
        }
    }
}
