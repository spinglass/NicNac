namespace maze {
    export class Game {
        scorePill: number
        scorePower: number

        constructor() {
            this.scorePill = 10
            this.scorePower = 200
        }

        init() {
            info.setScore(0)

            // register for events
            const events = getMaze().events
            events.register(Event.Pill, () => this.score(Event.Pill))
            events.register(Event.Power, () => this.score(Event.Power))
        }

        private score(event: Event) {
            let s = 0
            if (event == Event.Pill) {
                s = this.scorePill
            } else if (event == Event.Power) {
                s = this.scorePower
            }
            info.changeScoreBy(s)
        }
    }
}
