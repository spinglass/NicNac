namespace maze {
    export enum ScoreKind {
        Pill,
        Power,
    }

    export class Game {
        scorePill: number
        scorePower: number

        constructor() {
            this.scorePill = 10
            this.scorePower = 200
        }

        init() {
            info.setScore(0)
        }

        score(kind: ScoreKind) {
            let s = 0
            if (kind == ScoreKind.Pill) {
                s = this.scorePill
            } else if (kind == ScoreKind.Power) {
                s = this.scorePower
            }
            info.changeScoreBy(s)
        }
    }
}
