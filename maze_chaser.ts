namespace maze {
    export enum ChaserKind {
        Chaser1,
        Chaser2,
        Chaser3,
        Chaser4,
    }

    export class Chaser {
        maze: Maze
        mover: Mover
        kind: ChaserKind
        id: number
        name: string

        constructor(kind: ChaserKind, id: number, name: string) {
            this.mover = new Mover()
            this.kind = kind
            this.id = id
            this.name = name
        }

        init() {
            this.maze = getMaze()
            this.mover.init(this.name)
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