namespace maze {
    const MAX_EVENT_TIME = 1000000000

    export enum Event {
        EatPill,
        EatPower,
        EatFruit,
        EatChaser,
        LevelStart,
        LevelNext,
        LevelComplete,
        GameComplete,
        GameOver,
        FruitSpawn,
        FruitDespawn,
        Defrost,
        LoseLife,
        ChaserEndMode,
        ChaserWarn,
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
        maze: Maze
        handlers: Handler[]
        frameEvents: Event[]
        timedEvents: TimedEvent[]

        constructor() {
            this.handlers = []
            this.frameEvents = []
            this.timedEvents = []
        }

        init() {
            this.maze = getMaze()
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
                // create a new eventdwaa
                timedEvent = new TimedEvent(event)
                this.timedEvents.push(timedEvent)
            }

            // set the time (overrides any previous fire request)
            timedEvent.time = this.maze.time + (delaySeconds * 1000)
        }

        fireTimedEvents() {
            // find any events that are due
            for (const te of this.timedEvents) {
                if (this.maze.time >= te.time) {
                    const prevTime = te.time

                    this.callHandlers(te.event)

                    // don't clear event if it was re-queued by the handler
                    if (te.time == prevTime) {
                        te.time = MAX_EVENT_TIME
                    }
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