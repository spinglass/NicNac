//% weight=100 color=#0fbc11 icon="\uf11b" block="Maze"
namespace maze {
    class Maze {
        _hero: Hero

        constructor() {     
            this._hero = new Hero()
        }

        init() {
            this._hero.init(assets.image`hero`)

            game.onUpdate(() => getMaze().update())
        }

        initLevel(tilemap: tiles.TileMapData) {
            scene.setTileMapLevel(tilemap);
            this._hero.initLevel()
        }

        update() {
            this._hero.update()
        }
    }
    let _maze: Maze = null

    function getMaze() {
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
