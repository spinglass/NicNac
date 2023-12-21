//% weight=100 color=#0fbc11 icon="\uf11b" block="Maze"
namespace maze {
    export let runner: Runner
    export let audio: Audio
    export let events: EventManager
    export let level: Level
    export let map: Map
    export let hero: Hero
    export let chasers: Chaser[]
    export let fruit: Fruit
    
    function mazeInit() {
        if (runner) {
            return
        }

        // construct global objects
        runner = new Runner()
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

        runner.init()
        events.init()
        level.init()
        audio.init()
        hero.init()
        for (const chaser of chasers) {
            chaser.init()
        }
        fruit.init()
    }

    //% blockId=maze_set_tilema
    //% block="set maze to $tilemap"
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% tilemap.fieldOptions.taggedTemplate="tilemap"
    //% tilemap.fieldOptions.tileWidth=8
    export function setTilemap(tilemap: tiles.TileMapData) {
        mazeInit()

        scene.setTileMapLevel(tilemap)
        map.init(tilemap)

        runner.bootFlow()
    }
}
