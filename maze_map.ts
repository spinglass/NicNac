namespace maze {
    enum MapFlags {
        None = 0,
        Player = 1 << 0,
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

        init(tilemap: tiles.TileMapData) {
            this.w = tilemap.width
            this.h = tilemap.height
            this.tiles.length = (this.w * this.h)

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
    }

}
