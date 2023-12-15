namespace maze {
    export enum Effect {
        Pill,
        PowerPill,
        Count
    }

    export class Audio {
        sounds: music.Playable[]

        constructor() {
            this.sounds = []
            this.sounds.length = Effect.Count
        }

        init() {
            this.sounds[Effect.Pill] = music.createSoundEffect(WaveShape.Sine, 838, 2584, 120, 120, 60, SoundExpressionEffect.None, InterpolationCurve.Linear)
            this.sounds[Effect.PowerPill] = music.melodyPlayable(music.powerUp)
        }

        play(effect: Effect) {
            const s = this.sounds[effect]
            if (s) {
                music.play(s, music.PlaybackMode.InBackground)
            }
        }
    }
}