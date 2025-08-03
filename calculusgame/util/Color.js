/**
 * A class for handling colors. All UI elements should use the given color palette.
 */
export class Color {
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    // Palette designed to be colorblind friendly
    static black = new Color(43,43,43)
    static white = new Color(233,233,233)
    static gray = new Color(150,150,150) 
    static red = new Color(240,70,40) 
    static green = new Color(0,158,115) 
    static magenta = new Color(204,121,167) 
    static blue = new Color(86,180,233) 
    static yellow = new Color(240,228,66)
    
    // Additional colors (use for aesthetics only)
    static lightGray = new Color(190,190,190)
    static darkBlack = new Color(32,32,32)
    
    static adjustLightness(color, adjust){
        return new Color(color.r + adjust, color.g + adjust, color.b+adjust)
    }

    static setFillAndStroke(ctx, fill, stroke){
        ctx.fillStyle = `rgb(${fill.r},${fill.g},${fill.b})`
        ctx.strokeStyle = `rgb(${stroke.r},${stroke.g},${stroke.b})`
    }

    static setFill(ctx, color){
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`
    }

    static setStroke(ctx, color){
        ctx.strokeStyle = `rgb(${color.r},${color.g},${color.b})`
    }

    static setColor(ctx, color){
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`
        ctx.strokeStyle = `rgb(${color.r},${color.g},${color.b})`
    }
}