namespace maze {
    export class RunnerRevenge {

        init() {
            antiHero.init()
            for (const nom of noms) {
                nom.init()
            }

            events.register(Event.EatChaser, () => this.eatNom())
            
            info.setScore(0)
        }

        initLevel(levelIndex: number) {
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
            const scoreNom = 100
            info.changeScoreBy(scoreNom)
        }
    }
}
