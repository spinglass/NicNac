namespace maze {
    export enum MapFlags {
        None = 0,
        Empty = 1 << 0,
        Pill = 1 << 1,
        Power = 1 << 2,
        Player = 1 << 3,
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

        private setFlag(tx: number, ty: number, flag: MapFlags, on: boolean) {
            const i = this.getIndex(tx, ty)
            if (on) {
                this.tiles[i] |= flag
            } else {
                this.tiles[i] ^= flag
            }
        }

        getFlag(tx: number, ty: number, flag: MapFlags): boolean {
            const i = this.getIndex(tx, ty)
            return (this.tiles[i] & flag) != 0
        }

        private initHome() {
            // Find hero home
            this.homeX = 0
            this.homeY = 0
            const locs = tiles.getTilesByType(assets.tile`tile_home`)
            if (locs.length > 0) {
                for (const loc of locs) {
                    this.homeX += loc.x
                    this.homeY += loc.y
                }
                this.homeX /= locs.length
                this.homeY /= locs.length
            }
        }

        private initFlagsFromTiles(img: Image, flag: MapFlags) {
            const locs = tiles.getTilesByType(img)
            for (const loc of locs) {
                this.setFlag(loc.col, loc.row, flag, true)
            }
        }

        private initFlagsFromFlags(f1: MapFlags, f2: MapFlags) {
            for (let i = 0; i < this.tiles.length; ++i) {
                if (this.tiles[i] & f1) {
                    this.tiles[i] |= f2
                }
            }
        }

        private clearTile(tx: number, ty: number, flag: MapFlags): boolean  {      
            if (this.getFlag(tx, ty, flag)) {
                // clear the flag
                this.setFlag(tx, ty, flag, false)

                // hide the tile
                const loc = tiles.getTileLocation(tx, ty)
                tiles.setTileAt(loc, assets.tile`transparency16`)
                return true
            }
            return false
        }

        init(tilemap: tiles.TileMapData) {
            this.w = tilemap.width
            this.h = tilemap.height
            this.tiles.length = (this.w * this.h)

            // find player home position
            this.initHome()

            // find pill tiles
            this.initFlagsFromTiles(assets.tile`tile_empty`, MapFlags.Empty)
            this.initFlagsFromTiles(assets.tile`tile_home`, MapFlags.Empty)
            this.initFlagsFromTiles(assets.tile`tile_pill`, MapFlags.Pill)
            this.initFlagsFromTiles(assets.tile`tile_power`, MapFlags.Power)

            // find all player tiles
            this.initFlagsFromFlags(MapFlags.Empty, MapFlags.Player)
            this.initFlagsFromFlags(MapFlags.Pill, MapFlags.Player)
            this.initFlagsFromFlags(MapFlags.Power, MapFlags.Player)
        }

        eatPill(tx: number, ty: number):  boolean {
            return this.clearTile(tx, ty, MapFlags.Pill)
        }

        eatPower(tx: number, ty: number): boolean {
            return this.clearTile(tx, ty, MapFlags.Power)
        }
    }

}
