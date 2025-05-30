class Button{

    active = true

    constructor(origin_x, origin_y, width, height, onclick, label){
        this.toggled = false
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.width = width
        this.height = height
        this.onclick = onclick
        if (onclick == null){
            this.onclick = () => {}
        }
        this.label = label
        this.color = Color.white
        this.visible = true
    }

    draw(ctx){
        if (!this.visible){
            return
        }
        if (this.active){
            Color.setColor(ctx,this.color)
        }else{
            Color.setColor(ctx,Color.gray)
        }
        Shapes.Rectangle(ctx,this.origin_x,this.origin_y,this.width,this.height,10)
        ctx.font = "40px monospace"
        var text_size = ctx.measureText(this.label)
        // Adjust to fit inside label
        const font_size = Math.min(40 * this.width / text_size.width * 0.8 - 10, 40)
        ctx.font = font_size + "px monospace"
        text_size = ctx.measureText(this.label)
        // text baseline = top + half of height + half of font...
        ctx.fillText(this.label, this.origin_x + this.width/2-text_size.width/2, this.origin_y + this.height/2 + text_size.actualBoundingBoxAscent/2)
    }

    mouseMove(x,y){
        if (this.active && this.origin_x <= x && x <= this.origin_x + this.width && this.origin_y <= y && y <= this.origin_y + this.height){
            return 'pointer'
        }
        return null
    }

    // We need the mouse down data, but the object doesn't get grabbed
    mouseDown(x,y){
        if (this.active && this.origin_x <= x && x <= this.origin_x + this.width && this.origin_y <= y && y <= this.origin_y + this.height){
            this.onclick()
            return 'pointer'
        }
        return null
    }

    mouseUp(x,y){
        if (this.active && this.origin_x <= x && x <= this.origin_x + this.width && this.origin_y <= y && y <= this.origin_y + this.height){
            return 'pointer'
        }
        return null
    }

}