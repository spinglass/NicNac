namespace maze {
    export enum Direction {
        None = 0,
        Up = 1 << 0,
        Right = 1 << 1,
        Down = 1 << 2,
        Left = 1 << 3,
    }

    export function directionOpposite(dir: Direction): Direction {
        return (dir << 2) % 0xf
    }

    export function directionString(dir: Direction): string {
        switch (dir) {
            case Direction.None: return "none"
            case Direction.Up: return "up"
            case Direction.Right: return "right"
            case Direction.Down: return "down"
            case Direction.Left: return "left"
        }
        return null
    }

    export enum Difficulty {
        None,
        Easy,
        Hard,
    }

    export function difficultyString(diff: Difficulty) {
        switch (diff) {
            case Difficulty.None: return "None"
            case Difficulty.Easy: return "Easy"
            case Difficulty.Hard: return "Hard"
        }
        return null
    }
}