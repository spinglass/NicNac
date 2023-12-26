namespace maze {
    export class RunnerRevenge {
        pillsEaten: number
        pillsRemaining: number
        nomsRemaining: number
        
        init() {
            this.pillsRemaining = 0
            this.pillsEaten = 0
            
            antiHero.init()
            for (const nom of noms) {
                nom.init()
            }

            events.register(Event.EatChaser, () => this.eatNom())
            events.register(Event.EatPill, () => this.eatPill())
            events.register(Event.EatPower, () => this.eatPill())
            
            info.setScore(0)
        }

        initLevel(levelIndex: number) {
            this.pillsEaten = 0
            this.pillsRemaining = map.pillCount
            this.nomsRemaining = noms.length
            
            antiHero.initLevel()
            for (const nom of noms) {
                nom.initLevel()
            }

            scene.cameraFollowSprite(antiHero.mover.sprite)
        }

        resetLevel() {
            antiHero.resetLevel()
            for (const nom of noms) {
                nom.resetLevel()
            }
        }

        update() {
            antiHero.update()
            for (const nom of noms) {
                nom.update()
            }
        }

        setFreeze(freeze: boolean) {
            antiHero.mover.setFreeze(freeze)
            for (const nom of noms) {
                nom.mover.setFreeze(freeze)
            }
        }

        private eatNom() {
            info.changeScoreBy(10 * this.pillsRemaining)

            --this.nomsRemaining
            if (this.nomsRemaining <= 0) {
                runner.endLevel()

                if (runner.levelIndex >= 1) {
                    events.fireLater(Event.GameOver, 1.5)
                } else {
                    events.fire(Event.LevelComplete)
                    events.fireLater(Event.LevelNext, 1)
                }
            }
        }

        private eatPill() {
            ++this.pillsEaten
            --this.pillsRemaining
        }
    }
}
