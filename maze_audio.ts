namespace maze {
    export class Audio {

        constructor() {
        }

        init() {

            // register for events
            const events = getMaze().events

            const pill = music.createSoundEffect(WaveShape.Sine, 838, 2584, 120, 120, 60, SoundExpressionEffect.None, InterpolationCurve.Linear)
            events.register(Event.Pill, () => this.play(pill))

            const power = music.melodyPlayable(music.powerUp)
            events.register(Event.Power, () => this.play(power))

            const level = music.melodyPlayable(music.magicWand)
            events.register(Event.LevelComplete, () => this.play(level))
        }

        private play(sound: music.Playable) {
            if (sound) {
                music.play(sound, music.PlaybackMode.InBackground)
            }
        }
    }
}