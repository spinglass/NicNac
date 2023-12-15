namespace maze {
    export class Audio {

        constructor() {
        }

        init() {
            // register for events
            const events = getMaze().events

            const pill = music.createSoundEffect(WaveShape.Sine, 838, 2584, 120, 120, 60, SoundExpressionEffect.None, InterpolationCurve.Linear)
            events.register(Event.Pill, () => this.play(pill))

            const power = music.createSoundEffect(WaveShape.Sine, 595, 2020, 232, 0, 1000, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear)
            events.register(Event.Power, () => this.play(power))

            const fruit = music.melodyPlayable(music.baDing)
            events.register(Event.Fruit, () => this.play(fruit))

            const fruitSpawn = music.createSoundEffect(WaveShape.Sawtooth, 1, 4045, 255, 255, 250, SoundExpressionEffect.Warble, InterpolationCurve.Curve)
            events.register(Event.FruitSpawn, () => this.play(fruitSpawn))

            const fruitDespawn = music.createSoundEffect(WaveShape.Sawtooth, 3760, 1, 142, 149, 250, SoundExpressionEffect.Warble, InterpolationCurve.Curve)
            events.register(Event.FruitDespawn, () => this.play(fruitDespawn))

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