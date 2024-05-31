class Color {
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static black = new Color(40,40,40);
    static white = new Color(230,230,230);
    static red = new Color(248,60,65);

    static setColor(ctx, color){
        ctx.strokeStyle = `rgb(${color.r},${color.g},${color.b})`
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`
    }
}