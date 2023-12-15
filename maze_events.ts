namespace maze {
    export enum Event {
        Pill,
        Power,
        LevelComplete,
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

        constructor() {
            this.handlers = []
            this.frameEvents = []
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

        fireTimedEvents() {
            // TODO
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
    }
}