namespace maze {
    export enum ChaserKind {
        Blinky,
        Pinky,
        Inky,
        Clyde,
    }

    export class Chaser {
        maze: Maze
        mover: Mover
        kind: ChaserKind
        id: number

        constructor(kind: ChaserKind, id: number) {
            this.mover = new Mover()
            this.kind = kind
            this.id = id
        }

        init() {
            this.maze = getMaze()
            this.mover.init("chaser" + this.id)
            this.mover.mapType = MapFlags.Maze
        }

        initLevel() {
            this.mover.hx = this.maze.map.bases[this.id].x
            this.mover.hy = this.maze.map.bases[this.id].y
            this.mover.place()
        }

        update() {
            this.mover.update()
        }
    }
}