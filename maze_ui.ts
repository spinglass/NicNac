namespace maze
{
    class ButtonWrapper {
        private button: controller.Button
        private wasPressed: boolean
        pressed: boolean

        constructor(button: controller.Button) {
            this.button = button
            this.wasPressed = true
            this.pressed = false
        }

        update() {
            const pressed = this.button.isPressed()
            this.pressed = (pressed && !this.wasPressed)
            this.wasPressed = pressed
        }
    }

    class ControllerWrapper {
        private a: ButtonWrapper
        private b: ButtonWrapper
        private up: ButtonWrapper
        private down: ButtonWrapper
        private left: ButtonWrapper
        private right: ButtonWrapper

        constructor() {
            this.a = new ButtonWrapper(controller.A)
            this.b = new ButtonWrapper(controller.B)
            this.up = new ButtonWrapper(controller.up)
            this.down = new ButtonWrapper(controller.down)
            this.left = new ButtonWrapper(controller.left)
            this.right = new ButtonWrapper(controller.right)
        }

        get aPressed(): boolean { return this.a.pressed }
        get bPressed(): boolean { return this.b.pressed }
        get upPressed(): boolean { return this.up.pressed }
        get downPressed(): boolean { return this.down.pressed }
        get leftPressed(): boolean { return this.left.pressed }
        get rightPressed(): boolean { return this.right.pressed }

        update() {
            this.a.update()
            this.b.update()
            this.up.update()
            this.down.update()
            this.left.update()
            this.right.update()
        }
    }

    function drawDialog(body: string[], footer?: string) {
        const font = image.font8
        const dy = font.charHeight + 4
        const bodyHeight = body.length * dy + 4
        let y = (screen.height - bodyHeight) >> 1

        // header
        screen.fillRect(0, y - dy - 4, screen.width, dy + 4, 6)
        screen.print("NicNac", 8, y - dy, 1, font);

        // body
        screen.fillRect(0, y, screen.width, bodyHeight, 15)
        screen.drawLine(0, y, screen.width, y, 1)
        y += 4
        for (const line of body) {
            screen.print(line, 8, y, 6, font)
            y += dy
        }
        screen.fillRect(0, y, screen.width, 4, 6)
        screen.drawLine(0, y, screen.width, y, 1)

        if (footer) {
            const fdy = font.charHeight + 4
            let fy = screen.height - dy
            screen.fillRect(0, fy, screen.width, dy + 4, 6)
            screen.drawLine(0, fy, screen.width, fy, 1)
            fy += 2
            screen.print(footer, screen.width - footer.length * font.charWidth - 8, fy, 1, font)
        }
    }

    export function askOptions(header: string, options: string[], defaultChoice: number = 0): number {
        let choice = Math.min(defaultChoice, options.length - 1)

        controller._setUserEventsEnabled(false);
        control.pushEventContext();
            
        const cw = new ControllerWrapper()
        let firstTime = true
        pauseUntil(() => {
            let lines = []
            lines.push(header)
            for (let i = 0; i < options.length; ++i) {
                const line = ((i == choice) ? "> " : "  ") + options[i]
                lines.push(line)
            }
            drawDialog(lines, "Press A to confirm")

            if (firstTime) {
                pause(250)
                firstTime = false
            }
        
            cw.update()
            if (cw.aPressed || cw.bPressed) {
                // Done
                return true
            }
            if (cw.upPressed) {
                choice = Math.max(choice - 1, 0)
            } else if (cw.downPressed) {
                choice = Math.min(choice + 1, options.length - 1)
            }

            return false
        })
        screen.fillRect(0, 0, screen.width, screen.height, 0)
        control.popEventContext();
        controller._setUserEventsEnabled(true);

        return choice
    }

    export function showForTime(body: string[], footer: string, time: number) {
        controller._setUserEventsEnabled(false);
        control.pushEventContext();

        drawDialog(body, footer)
        pause(1000 * time)

        control.popEventContext();
        controller._setUserEventsEnabled(true);
    }

    export function show(body: string) {
        controller._setUserEventsEnabled(false);
        control.pushEventContext();

        drawDialog([body], "Press A to continue")
        pause(250)

        const cw = new ControllerWrapper()
        pauseUntil(() => {
            cw.update()
            return (cw.aPressed || cw.bPressed)
        });

        control.popEventContext();
        controller._setUserEventsEnabled(true);
    }
}