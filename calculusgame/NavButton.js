class NavButton{

    active = true

    constructor(origin_x, origin_y, width, height, onclick, label){
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.width = width
        this.height = height
        this.onclick = onclick
        this.label = label
        this.color = Color.white
    }

    draw(ctx){
        if (this.active){
            Color.setColor(ctx,this.color)
        }else{
            Color.setColor(ctx,Color.gray)
        }
        Shapes.Rectangle(ctx,this.origin_x,this.origin_y,this.width,this.height,10)
        ctx.font = "40px monospace"
        const textSize = ctx.measureText(this.label)
        ctx.fillText(this.label, this.origin_x + this.width/2-textSize.width/2, this.origin_y + this.height/2+10)
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