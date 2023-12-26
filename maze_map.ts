namespace maze {
    export enum MapFlags {
        None = 0,
        Empty = 1 << 0,
        Pill = 1 << 1,
        Power = 1 << 2,
        Tunnel = 1 << 3,
        Home = 1 << 4,
        Fruit = 1 << 5,
        Maze = 1 << 6,
        Base = 1 << 7,
        PillTile = 1 << 8,
        PowerTile = 1 << 9,
        Slow = 1 << 10,
    }
    
    export class Tile {
        tx: number
        ty: number

        constructor(tx: number, ty: number) {
            this.tx = tx
            this.ty = ty
        }

        // centre position x
        get cx(): number {
            return (8 * this.tx) + 4
        }

        // centre position y
        get cy(): number {
            return (8 * this.ty) + 4
        }

        getNext(dir: Direction): Tile {
            switch(dir) {
                case Direction.Up:      return new Tile(this.tx, this.ty - 1)
                case Direction.Down:    return new Tile(this.tx, this.ty + 1)
                case Direction.Left:    return new Tile(this.tx - 1, this.ty)
                case Direction.Right:   return new Tile(this.tx + 1, this.ty)
            }
            return this
        }

        getNextIn(dir: Direction, count: number): Tile {
            let result = new Tile(this.tx, this.ty)
            for (let i = 0; i < count; ++i) {
                result = result.getNext(dir)
            }
            return result
        }
    }

    export class Pos {
        x: number
        y: number

        constructor(x: number, y: number) {
            this.x = x
            this.y = y
        }
    }

    export function getTileFromWorldPosition(x: number, y: number) : Tile {
        const tx = (x >> 3)
        const ty = (y >> 3)
        return new Tile(tx, ty)
    }

    export class Map {
        flags: MapFlags[]
        w: number
        h: number
        home: Pos                   // hero spawn position
        chaserBase: Pos[]           // chaser spawn positions
        chaserReturn: Tile          // chaser return-to-base target
        chaserBaseCentre: Pos
        chaserBaseTop: Pos
        scatterTargets: Tile[]
        fruit: Pos
        bases: Tile[]
        tunnels: Tile[]
        pillCount: number

        constructor() {
            this.flags = []
            this.w = 0
            this.h = 0
            this.home = new Pos(0, 0)
            this.chaserBase = []
            this.chaserBaseCentre = new Pos(0, 0)
            this.chaserBaseTop = new Pos(0, 0)
            this.scatterTargets = []
            this.fruit = new Pos(0, 0)
            this.bases = []
            this.tunnels = []
            this.pillCount = 0
        }

        private getIndex(tx: number, ty: number) {
            return tx + (ty * this.w)
        }

        private setFlag(tx: number, ty: number, flag: MapFlags, on: boolean) {
            const i = this.getIndex(tx, ty)
            if (on) {
                this.flags[i] |= flag
            } else {
                this.flags[i] ^= flag
            }
        }

        getFlag(tile: Tile, flag: MapFlags): boolean {
            const i = this.getIndex(tile.tx, tile.ty)
            return (this.flags[i] & flag) != 0
        }

        private getTile(index: number) {
            const tx = index % this.w
            const ty = Math.floor(index / this.w)
            return new Tile(tx, ty)
        }

        private initPosition(f: MapFlags): Pos {
            let x = 0
            let y = 0
            let count = 0
            for (let i = 0; i < this.flags.length; ++i) {
                if (this.flags[i] & f) {
                    const tile = this.getTile(i)
                    x += tile.cx
                    y += tile.cy

                    if (f == MapFlags.Fruit) {
                        console.log("fruit: " + tile.cx + "," + tile.cy)
                    }

                    ++count
                }
            }
            if (count > 0) {
                x /= count
                y /= count
            }
            return new Pos(x, y)
        }

        private findTiles(flag: MapFlags): Tile[] {
            let tiles: Tile[] = []
            for (let i = 0; i < this.flags.length; ++i) {
                if (this.flags[i] & flag) {
                    const tile = this.getTile(i)
                    tiles.push(tile)
                }
            }
            return tiles
        }

        private initChaserBase() {
            // find extents of the base
            // assumption: base is a single horizontal row
            let minx = 10000
            let maxx = 0
            let cy = 0
            for (const tile of this.bases) {
                minx = Math.min(minx, tile.cx)
                maxx = Math.max(maxx, tile.cx)
                cy = tile.cy
            }

            // generate base positions for placing chasers
            const cx = (minx + maxx) / 2

            this.chaserBaseCentre = new Pos(cx, cy)
            this.chaserBaseTop = new Pos(cx, cy - 24)

            this.chaserBase.push(this.chaserBaseTop)
            this.chaserBase.push(this.chaserBaseCentre)
            this.chaserBase.push(new Pos(cx - 16, cy))   // left
            this.chaserBase.push(new Pos(cx + 16, cy))   // right
        
            // return-to-base tile is the above centre position
            this.chaserReturn = getTileFromWorldPosition(this.chaserBase[0].x, this.chaserBase[0].y)

            // also create scatter targets
            this.scatterTargets.push(new Tile(this.w - 1, 0))           // top-right
            this.scatterTargets.push(new Tile(0, 0))                    // top-left
            this.scatterTargets.push(new Tile(this.w - 1, this.h - 1))  // bottom-right
            this.scatterTargets.push(new Tile(0, this.h - 1))           // bottom-left
        }

        private initPills() {
            this.pillCount = 0
            for (const f of this.flags) {
                if ((f & MapFlags.Pill) || (f & MapFlags.Power))
                {
                    ++this.pillCount
                }
            }
        }

        private initFlagsFromTiles(img: Image, flag: MapFlags) {
            const locs = tiles.getTilesByType(img)
            for (const loc of locs) {
                this.setFlag(loc.col, loc.row, flag, true)
            }
        }

        private initFlagsFromFlags(f1: MapFlags, f2: MapFlags) {
            for (let i = 0; i < this.flags.length; ++i) {
                if (this.flags[i] & f1) {
                    this.flags[i] |= f2
                }
            }
        }

        private clearTile(tile: Tile, flag: MapFlags): boolean  {
            if (tile && this.getFlag(tile, flag)) {
                // clear the flag
                this.setFlag(tile.tx, tile.ty, flag, false)

                // hide the tile
                const loc = tiles.getTileLocation(tile.tx, tile.ty)
                tiles.setTileAt(loc, assets.tile`transparency16`)
                return true
            }
            return false
        }

        private initColor() {
            const pal = palette.defaultPalette()
            pal.setColor(10, level.color1)
            pal.setColor(11, level.color2)
            image.setPalette(pal.buf)
        }

        initLevel() {
            const tilemap = helpers.getTilemapByName(level.mapName)
            if (tilemap) {
                console.log("Map [" + level.mapName + "] loaded")
            }
            else {
                console.error("ERROR: Map [" + level.mapName + "] not found")
            }
            scene.setTileMapLevel(tilemap)

            this.flags = []
            this.chaserBase = []
            this.scatterTargets = []
            this.pillCount = 0

            this.w = tilemap.width
            this.h = tilemap.height
            this.flags = [this.w * this.h]
            this.flags.fill(MapFlags.None)

            // find all tiles of interest
            this.initFlagsFromTiles(assets.tile`tile_empty`, MapFlags.Empty)
            this.initFlagsFromTiles(assets.tile`tile_home`, MapFlags.Home)
            this.initFlagsFromTiles(assets.tile`tile_base`, MapFlags.Base)
            this.initFlagsFromTiles(assets.tile`tile_fruit`, MapFlags.Fruit)
            this.initFlagsFromTiles(assets.tile`tile_pill`, MapFlags.Pill)
            this.initFlagsFromTiles(assets.tile`tile_power`, MapFlags.Power)
            this.initFlagsFromTiles(assets.tile`tile_tunnel`, MapFlags.Tunnel)
            this.initFlagsFromTiles(assets.tile`tile_slow`, MapFlags.Slow)

            // mark pills for level reset
            this.initFlagsFromFlags(MapFlags.Pill, MapFlags.PillTile)
            this.initFlagsFromFlags(MapFlags.Power, MapFlags.PowerTile)

            // find all maze tiles
            for (const f of [MapFlags.Empty, MapFlags.Home, MapFlags.Fruit, MapFlags.Pill, MapFlags.Power, MapFlags.Base, MapFlags.Tunnel, MapFlags.Slow]) {
                this.initFlagsFromFlags(f, MapFlags.Maze)
            }

            this.initPills()
            this.bases = this.findTiles(MapFlags.Base)
            this.tunnels = this.findTiles(MapFlags.Tunnel)
            this.initChaserBase()

            // home position
            this.home = this.initPosition(MapFlags.Home)
        
            // fruits position
            this.fruit = this.initPosition(MapFlags.Fruit)

            this.initColor()
        }

        eatPill(tile: Tile):  boolean {
            return this.clearTile(tile, MapFlags.Pill)
        }

        eatPower(tile: Tile): boolean {
            return this.clearTile(tile, MapFlags.Power)
        }

        useTunnel(tile: Tile): Tile {
            if (tile && this.getFlag(tile, MapFlags.Tunnel)) {
                //this is a tunnel, find the other end,
                // assumed to be another tunnel tile with either the same tx or ty
                for (const tunnel of this.tunnels) {
                    if (tunnel.tx != tile.tx && tunnel.ty == tile.ty)
                    {
                        return tunnel
                    }
                }
            }
            return null
        }
    }

}
