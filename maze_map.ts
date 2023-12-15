namespace maze {
    export enum MapFlags {
        None = 0,
        Empty = 1 << 0,
        Pill = 1 << 1,
        Power = 1 << 2,
        Tunnel = 1 << 3,
        Home = 1 << 4,
        Player = 1 << 5,
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
    }

    export function getTileFromWorldPosition(x: number, y: number) : Tile {
        const tx = (x >> 3)
        const ty = (y >> 3)
        return new Tile(tx, ty)
    }

    export class Map {
        tiles: MapFlags[]
        w: number
        h: number
        homeX: number
        homeY: number
        tunnels: Tile[]

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

        private getTile(index: number) {
            const tx = index % this.w
            const ty = Math.floor(index / this.w)
            return new Tile(tx, ty)
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

        private initTunnels() {
            this.tunnels = []
            for (let i = 0; i < this.tiles.length; ++i) {
                if (this.tiles[i] & MapFlags.Tunnel) {
                    const tile = this.getTile(i)
                    this.tunnels.push(tile)
                    console.log("tunnel " + tile.tx + "," + tile.ty)
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
            for (let i = 0; i < this.tiles.length; ++i) {
                if (this.tiles[i] & f1) {
                    this.tiles[i] |= f2
                }
            }
        }

        private clearTile(tile: Tile, flag: MapFlags): boolean  {
            if (tile && this.getFlag(tile.tx, tile.ty, flag)) {
                // clear the flag
                this.setFlag(tile.tx, tile.ty, flag, false)

                // hide the tile
                const loc = tiles.getTileLocation(tile.tx, tile.ty)
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
            this.initFlagsFromTiles(assets.tile`tile_tunnel`, MapFlags.Tunnel)

            // find all player tiles
            this.initFlagsFromFlags(MapFlags.Empty, MapFlags.Player)
            this.initFlagsFromFlags(MapFlags.Pill, MapFlags.Player)
            this.initFlagsFromFlags(MapFlags.Power, MapFlags.Player)
            this.initFlagsFromFlags(MapFlags.Tunnel, MapFlags.Player)

            this.initTunnels()
        }

        eatPill(tile: Tile):  boolean {
            return this.clearTile(tile, MapFlags.Pill)
        }

        eatPower(tile: Tile): boolean {
            return this.clearTile(tile, MapFlags.Power)
        }

        useTunnel(tile: Tile): Tile {
            if (tile && this.getFlag(tile.tx, tile.ty, MapFlags.Tunnel)) {
                //this is a tunnel, find the other end,
                // assumed to be another tunnel tile with either the same tx or ty
                for (const tunnel of this.tunnels) {
                    if ((tunnel.tx == tile.tx && tunnel.ty != tile.ty) || (tunnel.tx != tile.tx && tunnel.ty == tile.ty))
                    {
                        return tunnel
                    }
                }
            }
            return null
        }
    }

}
