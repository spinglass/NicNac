//% weight=100 color=#0fbc11 icon="\uf11b" block="Maze"
namespace maze {
    export enum Direction {
        None = 0,
        Up = 1 << 0,
        Right = 1 << 1,
        Down = 1 << 2,
        Left = 1 << 3,
    }

    export function opposite(dir: Direction): Direction {
        return (dir << 2) % 0xf
    }
    
    export class Maze {
        audio: Audio
        game: Game
        hero: Hero
        map: Map

        constructor() {     
            this.audio = new Audio()
            this.game = new Game()
            this.hero = new Hero()
            this.map = new Map()
        }

        init() {
            this.audio.init()
            this.game.init()
            this.hero.init(assets.image`hero`)

            game.onUpdate(() => getMaze().update())
        }

        initLevel(tilemap: tiles.TileMapData) {
            scene.setTileMapLevel(tilemap);
            this.map.init(tilemap)
            this.hero.initLevel()
        }

        update() {
            this.hero.update()
        }
    }
    let _maze: Maze = null

    export function getMaze() {
        if (!_maze) {
            _maze = new Maze()
            _maze.init()
        }
        return _maze
    }

    //% blockId=maze_set_tilema
    //% block="set maze to $tilemap"
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% tilemap.fieldOptions.taggedTemplate="tilemap"
    //% tilemap.fieldOptions.tileWidth=8
    export function setTilemap(tilemap: tiles.TileMapData) {
        getMaze().initLevel(tilemap)
    }
}
