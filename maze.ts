//% weight=100 color=#0fbc11 icon="\uf11b" block="Maze"
namespace maze {
    export let runner: Runner
    export let audio: Audio
    export let events: EventManager
    export let level: Level
    export let map: Map
    export let hero: Hero
    export let chasers: Chaser[]
    export let antiHero: AntiHero
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
        antiHero = new AntiHero()
        fruit = new Fruit()
    }

    //% blockId=maze_add_tilemap
    //% block="add $tilemap"
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% tilemap.fieldOptions.taggedTemplate="tilemap"
    //% tilemap.fieldOptions.tileWidth=8
    export function add(tilemap: tiles.TileMapData) {
        // no nothing - this function is simply a way to expose the correct tile map editor
    }

    //% blockId=maze_run
    //% block="run the game"
    export function run() {
        mazeInit()
        runner.bootFlow()
    }
}
