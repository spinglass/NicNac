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
    
    export class Maze {
        audio: Audio
        events: EventManager
        game: Game
        map: Map
        hero: Hero
        chasers: Chaser[]
        fruit: Fruit

        constructor() {     
            this.audio = new Audio()
            this.events = new EventManager()
            this.game = new Game()
            this.map = new Map()
            this.hero = new Hero()
            this.fruit = new Fruit()
            this.chasers = [new Chaser(ChaserKind.Chaser1, 0, "chaser1") ]
        }

        init() {
            this.audio.init()
            this.game.init()
            this.hero.init()
            for (const c of this.chasers) {
                c.init()
            }
            this.fruit.init()

            game.onUpdate(() => getMaze().update())
        }

        initLevel(tilemap: tiles.TileMapData) {
            scene.setTileMapLevel(tilemap);
            this.map.init(tilemap)
            this.game.initLevel()
            this.hero.initLevel()
            for (const c of this.chasers) {
                c.initLevel()
            }
            this.fruit.initLevel()
        }

        update() {
            // fire any due events
            this.events.fireTimedEvents()
            
            // update game elements
            this.hero.update()
            for (const c of this.chasers) {
                c.update()
            }
            this.fruit.update()

            // finally fire frame events
            this.events.fireFrameEvents()
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
