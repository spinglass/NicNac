namespace maze {
    export class RunnerStandard {
        pillsEaten: number
        pillsRemaining: number
        levelComplete: boolean
        chaserMode: ChaserMode
        chaserEatCount: number
        chaserWarn: boolean
        
        init() {
            this.pillsRemaining = 0
            this.pillsEaten = 0
            this.levelComplete = false

            hero.init()
            for (const chaser of chasers) {
                chaser.init()
            }
            fruit.init()

            // register for events
            events.register(Event.EatPill, () => this.eat(Event.EatPill))
            events.register(Event.EatPower, () => this.eat(Event.EatPower))
            events.register(Event.EatFruit, () => this.eat(Event.EatFruit))
            events.register(Event.EatChaser, () => this.eat(Event.EatChaser))
            events.register(Event.DefrostHero, () => this.defrostHero())
            events.register(Event.LoseLife, () => this.life())
            events.register(Event.ChaserEndMode, () => this.chaserEndMode())
            events.register(Event.ChaserWarn, () => this.chaserSetWarn())

            info.setScore(0)
            info.setLife(level.lives)
        }

        initLevel(levelIndex: number) {
            hero.initLevel()
            for (const chaser of chasers) {
                chaser.initLevel()
            }
            fruit.initLevel(levelIndex)

            this.pillsEaten = 0
            this.pillsRemaining = map.pillCount
            this.levelComplete = false
            this.chaserEatCount = 0
            this.chaserWarn = false

            scene.cameraFollowSprite(hero.mover.sprite)
        }

        resetLevel() {
            // set mode
            if (level.enableScatter) {
                this.setChaserMode(ChaserMode.Scatter)
                events.fireLater(Event.ChaserEndMode, level.timeScatter)
            } else {
                this.setChaserMode(ChaserMode.Chase)
            }
            this.chaserEatCount = 0

            hero.resetLevel()
            for (let i = 0; i < chasers.length; ++i) {
                const chaser = chasers[i]
                chaser.resetLevel()
            }
            this.updateRelease()
            fruit.resetLevel()
        }

        update() {
            hero.update()
            for (const chaser of chasers) {
                chaser.update()
            }
            fruit.update()
        }

        setFreeze(freeze: boolean) {
            hero.mover.setFreeze(freeze)
            for (const chaser of chasers) {
                chaser.mover.setFreeze(freeze)
            }
        }

        private freezeHero(time: number) {
            hero.mover.setFreeze(true, false)
            events.fireLater(Event.DefrostHero, time)
        }

        private defrostHero() {
            if (!runner.freeze) {
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
                runner.pause(1)
            }
            info.changeScoreBy(s)

            // check for completing the level
            if (!this.levelComplete && (event == Event.EatPill || event == Event.EatPower)) {
                ++this.pillsEaten
                --this.pillsRemaining

                fruit.checkSpawn(this.pillsEaten)

                if (this.pillsRemaining <= 0) {
                    runner.endLevel()
                    this.levelComplete = true
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
            runner.endLevel()

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
                    if (level.enableScatter) {
                        events.fireLater(Event.ChaserEndMode, level.timeChase)
                    }
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

        private updateRelease() {
            for (let i = 0; i < chasers.length; ++i) {
                if (level.pillReleaseCount[i] == this.pillsEaten) {
                    chasers[i].setRelease()
                }
            }
        }

        private setChaserMode(mode: ChaserMode) {
            this.chaserMode = mode
            hero.chaserMode = mode
            for (const chaser of chasers) {
                chaser.setMode(mode)
            }
        }
    }
}
