namespace maze {
    const MAX_EVENT_TIME = 1000000000

    export enum Event {
        Pill,
        Power,
        LevelComplete,
        NextLevel,
        GameComplete,
        GameOver,
        Fruit,
        FruitSpawn,
        FruitDespawn,
        Defrost,
    }

    class TimedEvent {
        event: Event
        time: number
        
        constructor(event: Event) {
            this.event = event
            this.time = MAX_EVENT_TIME
        }
    }

    class Handler {
        event: Event
        callback: () => void

        constructor(event: Event, callback: () => void) {
            this.event = event
            this.callback = callback
        }
    }

    export class EventManager {
        handlers: Handler[]
        frameEvents: Event[]
        timedEvents: TimedEvent[]
        time: number

        constructor() {
            this.handlers = []
            this.frameEvents = []
            this.timedEvents = []
            this.time = 0
        }

        private callHandlers(event: Event) {
            for (const handler of this.handlers) {
                if (event == handler.event) {
                    handler.callback()
                }
            }
        }

        fire(event: Event) {
            this.frameEvents.push(event)
        }

        fireLater(event: Event, delaySeconds: number) {
            let timedEvent: TimedEvent = null

            // re-use existing event if one already exists
            for (const te of this.timedEvents) {
                if (te.event == event) {
                    timedEvent = te
                    break
                }
            }

            if (!timedEvent) {
                // create a new event
                timedEvent = new TimedEvent(event)
                this.timedEvents.push(timedEvent)
            }

            // set the time (overrides any previous fire request)
            timedEvent.time = this.time + (delaySeconds * 1000)
        }

        fireTimedEvents() {
            this.time = game.runtime()

            // find any events that are due
            for (const te of this.timedEvents) {
                if (this.time >= te.time) {
                    this.callHandlers(te.event)
                    te.time = MAX_EVENT_TIME
                }
            }
        }

        register(event: Event, callback: () => void) {
            const handler = new Handler(event, callback)
            this.handlers.push(handler)
        }

        fireFrameEvents() {
            // loop such that any handlers that fire further events will also be handled
            // IMPORTANT: if a handler fires the same event it's handling, that could be a soft-lock
            while (this.frameEvents.length > 0) {
                this.callHandlers(this.frameEvents.shift())
            }
        }

        cancel(event: Event) {
            for (const e of this.timedEvents) {
                if (e.event == event) {
                    e.time = MAX_EVENT_TIME
                }
            }
        }

        cancelAll() {
            this.frameEvents = []
            this.timedEvents = []
        }
    }
}