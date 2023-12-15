namespace maze {
    export class Hero {
        maze: Maze
        mover: Mover

        constructor() {
            this.mover = new Mover()
        }

        init(img: Image) {
            this.maze = getMaze()
            this.mover.init(img)
            this.mover.mapType = MapFlags.Player
            scene.cameraFollowSprite(this.mover.sprite)
        }

        initLevel() {
            this.mover.hx = this.maze.map.homeX
            this.mover.hy = this.maze.map.homeY
            this.place()
        }

        place() {
            this.mover.place()
        }

        update() {
            if (controller.up.isPressed()) {
                this.mover.request = Direction.Up
            } else if (controller.down.isPressed()) {
                this.mover.request = Direction.Down
            } else if (controller.left.isPressed()) {
                this.mover.request = Direction.Left
            } else if (controller.right.isPressed()) {
                this.mover.request = Direction.Right
            }

            this.mover.update()

            if (this.mover.changedTile) {
                if (this.maze.map.eatPill(this.mover.tile)) {
                    this.maze.events.fire(Event.Pill)
                } else if (this.maze.map.eatPower(this.mover.tile)) {
                    this.maze.events.fire(Event.Power)
                }
            }
        }
    }
}
