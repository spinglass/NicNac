namespace maze {
    export class Runner {
        mode: Mode
        levelIndex: number
        freeze: boolean
        modeRunner: any

        constructor() {
        }

        init() {
            this.mode = Mode.None
            this.levelIndex = 0
            this.freeze = true

            events.init()
            level.init()
            audio.init()

            // register for events
            events.register(Event.LevelStart, () => this.resetLevel())
            events.register(Event.LevelNext, () => this.levelNext())
            events.register(Event.Defrost, () => this.setFreeze(false))
            events.register(Event.GameOver, () => this.gameOver())

            game.onUpdate(() => this.update())
        }

        bootFlow() {
            this.init()

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
            const result = askOptions("Select mode", ["Easy", "Hard", "Mouth-Man", "Ghost Revenge"], defaultMode - 1)
            this.mode = result + 1
            settings.writeNumber("maze_mode", this.mode)

            // get high-score for mode
            const modeName = modeString(this.mode)
            let highScore = settings.readNumber("high_score_" + modeName)
            if (!highScore) {
                highScore = 0
            }
            settings.writeNumber("high-score", highScore)
            showForTime([modeName, "High score: " + highScore], null, 2)

            level.initLevel(this.mode, 0)
            
            if (this.mode == Mode.GhostRevenge) {
                this.modeRunner = new RunnerRevenge()
            }
            else {
                this.modeRunner = new RunnerStandard()
            }
            this.modeRunner.init()

            this.initLevel()
        }

        initLevel() {
            level.initLevel(this.mode, this.levelIndex)
            map.initLevel()

            this.modeRunner.initLevel(this.levelIndex)

            events.cancelAll()
            events.fireLater(Event.LevelStart, 0)
        }

        pause(time: number) {
            this.setFreeze(true)
            events.fireLater(Event.Defrost, time)
        }

        setFreeze(freeze: boolean) {
            this.freeze = freeze
            this.modeRunner.setFreeze(freeze)
        }

        endLevel() {
            this.setFreeze(true)
            events.cancelAll()
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
            this.modeRunner.resetLevel()
            this.pause(1.5)
        }

        private levelNext() {
            ++this.levelIndex;
            this.initLevel()
        }

        private update() {
            // fire any due events
            events.fireTimedEvents()

            if (controller.A.isPressed() || controller.B.isPressed()) {
                if (level.levelSkip) {
                    this.setFreeze(true)
                    events.fireLater(Event.LevelNext, 1)
                } else {
                    show("Game paused")
                    this.pause(1.0)
                }
            }
            
            if (!this.freeze) {
                // Update the game mode
                this.modeRunner.update()

                // finally fire frame events
                events.fireFrameEvents()
            }
        }
    }
}
