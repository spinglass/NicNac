namespace maze {
    export enum Event {
        Pill,
        Power,
        UseTunnel
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
            for (const event of this.frameEvents) {
                this.callHandlers(event)
            }
            this.frameEvents = []
        }
    }
}