//% weight=100 color=#0fbc11 icon="\uf11b" block="Maze"
namespace maze {
    export let audio: Audio
    export let events: EventManager
    export let level: Level
    export let map: Map
    export let hero: Hero
    export let chasers: Chaser[]
    export let fruit: Fruit

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

    export function dirString(dir: Direction): string {
        switch (dir) {
            case Direction.None:    return "none"
            case Direction.Up:      return "up"
            case Direction.Right:   return "right"
            case Direction.Down:    return "down"
            case Direction.Left:    return "left"
        }
        return null
    }
    
    class Maze {
        game: Game
        time: number

        init() {
            this.time = game.runtime()
            this.game = new Game()

            // construct global objects
            audio = new Audio()
            events = new EventManager()
            level = new Level()
            map = new Map()
            hero = new Hero()
            chasers = [
                new Chaser(ChaserKind.Blinky, 0),
                new Chaser(ChaserKind.Pinky, 1),
                new Chaser(ChaserKind.Inky, 2),
                new Chaser(ChaserKind.Clyde, 3)
            ]
            fruit = new Fruit()

            events.init(this.time)
            level.init()
            audio.init()
            this.game.init()
            hero.init()
            for (const chaser of chasers) {
                chaser.init()
            }
            fruit.init()

            game.onUpdate(() => getMaze().update())
        }

        initLevel(tilemap: tiles.TileMapData) {
            scene.setTileMapLevel(tilemap)
            map.init(tilemap)

            this.game.bootFlow()
            this.game.initLevel()
        }

        update() {
            this.time = game.runtime()
            
            // fire any due events
            events.fireTimedEvents(this.time)
            
            // update game elements
            this.game.update()
            hero.update()
            for (const chaser of chasers) {
                chaser.update()
            }
            fruit.update()

            // finally fire frame events
            events.fireFrameEvents()
        }
    }
    let _maze: Maze

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
