namespace maze
{
    // modified version of game.ask to allow different options from ok/cancel
    export function ask(title: string, subtitle: string, footer: string): boolean {
        controller._setUserEventsEnabled(false);
        control.pushEventContext();
        game.showDialog(title, subtitle, footer);
        pause(250)
        let answer: boolean = null;
        let aNotHeld = false;
        let bNotHeld = false;
        pauseUntil(() => {
            aNotHeld = aNotHeld || !controller.A.isPressed();
            bNotHeld = bNotHeld || !controller.B.isPressed();

            if (aNotHeld && controller.A.isPressed()) {
                answer = true;
            } else if (bNotHeld && controller.B.isPressed()) {
                answer = false;
            }
            return answer !== null;
        });
        control.popEventContext();
        controller._setUserEventsEnabled(true);
        return answer
    }

    export function show(title: string, subtitle: string, footer: string, time: number) {
        controller._setUserEventsEnabled(false);
        control.pushEventContext();
        game.showDialog(title, subtitle, footer);
        pause(1000 * time)
        control.popEventContext();
        controller._setUserEventsEnabled(true);
    }

}