namespace maze {
    export class Level {
        // game settings
        version: number         // high-scores will reset on version change
        lives: number
        mapName: string
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
        fruitSpawns: number[]

        // chaser settings
        speedChaser: number
        speedChaserFright: number
        speedChaserTunnel: number
        speedChaserWait: number
    
        // hero settings
        speedHero: number
        speedHeroFright: number
        immortal: boolean

        // maze settings
        color1: number
        color2: number

        init() {
            this.version = 1
            this.lives = 3
            this.mapName = "maze_standard"
            this.scorePill = 10
            this.scorePower = 50
            this.scoreFruit = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000]
            this.scoreChaser = [100, 200, 400, 800]
            this.timeScatter = 7
            this.timeChase = 20
            this.timeFright = 7
            this.timeWarn = 5
            this.timeWarnFlash = 0.25
            this.timeFruitDespawn = 10
            this.pillReleaseCount = [0, 0, 30, 90]
            this.fruitSpawns =  [70, 170]

            this.speedChaser = 75
            this.speedChaserFright = 50
            this.speedChaserTunnel = 40
            this.speedChaserWait = 50

            this.speedHero = 50
            this.speedHeroFright = 60
            this.immortal = false

            this.color1 = 0x003fad
            this.color2 = 0x000804
        }

        initLevel(mode: Mode, index: number) {
            this.init()

            switch (mode) {
                case Mode.Easy: return this.initEasy(index)
                case Mode.Hard: return this.initHard(index)
                case Mode.MouthMan: return this.initMouthman(index)
            }
        }

        private initEasy(index: number) {
            console.log("easy:" + index)

            this.timeScatter = 14
            this.timeFright = 20
            this.timeWarn = 17
            this.timeFruitDespawn = 20
            this.pillReleaseCount = [0, 20, 50, 100]
            
            this.speedChaser = 45
            this.speedChaserFright = 25
            this.speedChaserTunnel = 20
            this.speedChaserWait = 25

            switch (index) {
                case 0:
                    this.speedHero = 50
                    this.speedHeroFright = 60
                    break
                case 1:
                case 2:
                    this.speedHero = 55
                    this.speedHeroFright = 60
                    break
                // level 4 onwards
                default:
                    this.speedHero = 60
                    this.speedHeroFright = 60
                    break
            }
        }

        private initHard(index: number) {
            console.log("hard:" + index)

            switch(index) {
                case 0:
                    this.speedChaser = 65
                    this.speedChaserFright = 45  
                    this.speedChaserTunnel = 35
                    this.speedHero = 70
                    this.speedHeroFright = 75
                    this.timeFright = 10
                    this.timeWarn = 8
                    break
                case 1:
                    this.speedChaser = 75
                    this.speedChaserFright = 50
                    this.speedChaserTunnel = 50
                    this.speedHero = 80
                    this.speedHeroFright = 85
                    this.timeFright = 9
                    this.timeWarn = 7
                    break
                case 2:
                    this.speedChaser = 75
                    this.speedChaserFright = 50
                    this.speedChaserTunnel = 40
                    this.speedHero = 80
                    this.speedHeroFright = 85
                    this.timeFright = 8
                    this.timeWarn = 6
                    break
                case 3:
                    this.speedChaser = 75
                    this.speedChaserFright = 50
                    this.speedChaserTunnel = 40
                    this.speedHero = 80
                    this.speedHeroFright = 85
                    this.timeFright = 5
                    this.timeWarn = 3.5
                    break
                // level 4 onwards
                default:
                    this.speedChaser = 85
                    this.speedChaserFright = 55
                    this.speedChaserTunnel = 45
                    this.speedHero = 90
                    this.speedHeroFright = 95
                    this.timeFright = 4
                    this.timeWarn = 3
                    break
            }
        }

        private initMouthman(index: number) {
            console.log("mouthman:" + index)

            this.speedChaser = 60
            this.speedChaserFright = 40
            this.speedChaserTunnel = 30
            this.speedHero = 70
            this.speedHeroFright = 75
            this.timeFright = 10
            this.timeWarn = 8

            switch (index) {
                default:
                case 0:
                    this.mapName = "maze_standard"
                    this.color1 = 0x0070fe
                    this.color2 = 0x000804
                    break
                case 1:
                    this.mapName = "maze_standard"
                    this.color1 = 0x00e0fe
                    this.color2 = 0x0074fd
                    break
                case 2:
                    this.mapName = "maze_mm0"
                    this.color1 = 0x95e702
                    this.color2 = 0x2f9401
                    break
            }
        }
    }
}