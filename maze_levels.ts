namespace maze {

    export class Level {
        // game settings
        lives: number
        scorePill: number
        scorePower: number
        scoreFruit: number[]
        scoreChaser: number[]
        timeScatter: number
        timeChase: number
        timeFright: number
        timeWarn: number
        timeWarnFlash: number
        timeFruitDespawn: number
        pillReleaseCount: number[]

        // chaser settings
        speedChaser: number
        speedChaserFright: number
        speedChaserWait: number

        // hero settings
        speedHero: number
        immortal: boolean

        init() {
            this.lives = 3
            this.scorePill = 10
            this.scorePower = 50
            this.scoreFruit = [200, 400, 600, 800, 1000]
            this.scoreChaser = [100, 200, 400, 800]
            this.timeScatter = 7
            this.timeChase = 20
            this.timeFright = 7
            this.timeWarn = 5
            this.timeWarnFlash = 0.25
            this.timeFruitDespawn = 10
            this.pillReleaseCount = [0, 0, 30, 90]

            this.speedChaser = 75
            this.speedChaserFright = 40
            this.speedChaserWait = 40

            this.speedHero = 80
            this.immortal = false

            switch (getMaze().game.difficulty) {
                case Difficulty.Easy: return this.initEasy()
                case Difficulty.Hard: return this.initHard()
            }
        }

        private initEasy() {
            this.timeScatter = 14
            this.timeFright = 14
            this.timeWarn = 5
            this.timeFruitDespawn = 20
            this.pillReleaseCount = [0, 20, 50, 100]
            
            this.speedChaser = 45
            this.speedChaserFright = 25
            this.speedChaserWait = 25

            this.speedHero = 50
        }

        private initHard() {
        }
    }
    
    export let level: Level
}