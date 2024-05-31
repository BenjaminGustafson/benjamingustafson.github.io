class DragBlock {
    grabbed = false;
    grabPriority = 0
    grabX = 0;
    grabY = 0;
    color = "rgb(0,0,0)";
    grabColor = "rgb(100,100,100)"
    constructor (x, y, width, height){
        this.x = x;
        this.y = y; 
        this.width = width;
        this.height = height;
    }

    mouseDown(mx,my,grabber){
        if (!this.grabbed && this.x <= mx && mx <= this.x + this.width
                          && this.y <= my && my <= this.y + this.height){
            if (grabber.priority < this.grabPriority){
                grabber.priority = this.grabPriority
                grabber.obj = this
            }
            this.grabX = mx - this.x;
            this.grabY = my - this.y;
        }
    }

    mouseUp(mx,my){
        this.grabbed = false;
    }

    mouseMove(mx,my){
        if (this.grabbed){
            this.x = mx - this.grabX;
            this.y = my - this.grabY;
        }
    }

    draw(ctx){
        if (this.grabbed){
            ctx.strokeStyle = this.grabColor
            ctx.fillStyle = ctx.strokeStyle
        }else{
            ctx.strokeStyle = this.color
            ctx.fillStyle = ctx.strokeStyle
        }
        ctx.strokeRect(this.x, this.y, this.width, this.height)

    }

}