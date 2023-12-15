namespace maze {
    export enum MapFlags {
        None = 0,
        Player = 1 << 0,
        Pill = 1 << 1,
        PowerPill = 1 << 2,
    }

    export class Map {
        tiles: MapFlags[]
        w: number
        h: number
        homeX: number
        homeY: number

        constructor() {
            this.tiles = []
            this.w = 0
            this.h = 0
            this.homeX = 0
            this.homeY = 0
        }

        private getIndex(tx: number, ty: number) {
            return tx + (ty * this.w)
        }


        getFlag(tx: number, ty: number, flag: MapFlags): boolean {
            const i = this.getIndex(tx, ty)
            return (this.tiles[i] & flag) != 0
        }

        setFlag(tx: number, ty: number, flag: MapFlags, on: boolean) {
            const i = this.getIndex(tx, ty)
            if (on) {
                this.tiles[i] |= flag
            } else {
                this.tiles[i] ^= flag
            }
        }

        private initHome() {
            // Find hero home
            this.homeX = 0
            this.homeY = 0
            const locs = tiles.getTilesByType(assets.tile`tile_hero`)
            if (locs.length > 0) {
                for (const loc of locs) {
                    this.homeX += loc.x
                    this.homeY += loc.y
                }
                this.homeX /= locs.length
                this.homeY /= locs.length
            }
        }

        private initTiles(img: Image, flag: MapFlags) {
            const locs = tiles.getTilesByType(img)
            for (const loc of locs) {
                this.setFlag(loc.col, loc.row, flag, true)
                console.log("flag: " + flag + " " + loc.col + "," + loc.row)
            }
        }

        init(tilemap: tiles.TileMapData) {
            this.w = tilemap.width
            this.h = tilemap.height
            this.tiles.length = (this.w * this.h)

            this.initHome()
            this.initTiles(assets.tile`tile_pill`, MapFlags.Pill)
            this.initTiles(assets.tile`tile_powerpill`, MapFlags.PowerPill)
        }

        private eat(tx: number, ty: number, flag: MapFlags): boolean  {      
            if (this.getFlag(tx, ty, flag)) {
                this.setFlag(tx, ty, flag, false)

                // Hide the tile
                const loc = tiles.getTileLocation(tx, ty)
                tiles.setTileAt(loc, assets.tile`transparency16`)
                return true
            }
            return false
        }

        eatPill(tx: number, ty: number):  boolean {
            return this.eat(tx, ty, MapFlags.Pill)
        }

        eatPowerPill(tx: number, ty: number): boolean {
            return this.eat(tx, ty, MapFlags.PowerPill)
        }
    }

}
