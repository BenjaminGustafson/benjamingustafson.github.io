export class TileMap {


    /**
     * Maps are isometric tiles of 128 x 64. 
     * Maps are 1600 x 900, which is 12.5 x 14.0625 tiles
     * 
     * The top left corner should be at a tile intersection
     * The tile coordinates can be adjusted for a given map
     * 
     * The default img offset is for 512x512 tile images
     */
    constructor({xTileOffset= 0, yTileOffset= 0, xImgOffset = -160, yImgOffset=192}){
        Object.assign(this, {xTileOffset, yTileOffset, xImgOffset, yImgOffset})
    }

    isometricToCanvas(x, y){
        const cx = (x+this.xTileOffset) * 64 + (y + this.yTileOffset) * -64 + this.xImgOffset
        const cy = (x+this.xTileOffset) * 32 + (y + this.yTileOffset) * 32 + this.yImgOffset
        return {x: cx, y : cy}
    }


    
    
}