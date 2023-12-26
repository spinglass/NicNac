namespace maze {
    export class RunnerRevenge {

        init() {
            antiHero.init()
            fruit.init()

            info.setScore(0)
        }

        initLevel(levelIndex: number) {
            antiHero.initLevel()
            fruit.initLevel(levelIndex)

            scene.cameraFollowSprite(antiHero.mover.sprite)
        }

        resetLevel() {
            antiHero.resetLevel()
            fruit.resetLevel()
        }

        update() {
            antiHero.update()
            fruit.update()
        }

        setFreeze(freeze: boolean) {
            antiHero.mover.setFreeze(freeze)
        }
    }
}
