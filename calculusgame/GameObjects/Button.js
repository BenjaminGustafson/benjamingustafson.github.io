/**
 * A button GameObject
 * 
 * Buttons are rectangular and have a text label.
 * 
 */
class Button{

    active = true

    /**
     * 
     * @param {number} originX x-value of left of button rectangle 
     * @param {number} originY y-value of top of button rectangle
     * @param {number} width
     * @param {number} height 
     * @param {Function} onclick function that is called when button is clicked
     * @param {string} label the text to go in the button
     */
    constructor(originX, originY, width, height, onclick, label){
        this.originX = originX
        this.originY = originY
        this.width = width
        this.height = height
        this.onclick = onclick
        if (onclick == null){
            this.onclick = () => {}
        }
        this.label = label
        // Additional fields:
        this.color = Color.white // the color to draw the outline of the button and text
        this.visible = true // when false the button is not drawn, but is still clickable
        this.active = true // when false the button is not clickable and is drawn in gray
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
        Shapes.Rectangle(ctx,this.originX,this.originY,this.width,this.height,10)
        ctx.font = "40px monospace"
        ctx.textBaseline = 'alphabetic'
        ctx.textAlign = 'start'
        var text_size = ctx.measureText(this.label)
        // Adjust to fit inside label
        const font_size = Math.min(40 * this.width / text_size.width * 0.8 - 10, 40)
        ctx.font = font_size + "px monospace"
        text_size = ctx.measureText(this.label)
        // text baseline = top + half of height + half of font...
        ctx.fillText(this.label, this.originX + this.width/2-text_size.width/2, this.originY + this.height/2 + text_size.actualBoundingBoxAscent/2)
    }

    // When mouse is over button, change cursor to pointer
    mouseMove(x,y){
        if (this.active && this.originX <= x && x <= this.originX + this.width && this.originY <= y && y <= this.originY + this.height){
            return 'pointer'
        }
        return null
    }

    // When clicked, call the onclick method
    mouseDown(x,y){
        if (this.active && this.originX <= x && x <= this.originX + this.width && this.originY <= y && y <= this.originY + this.height){
            this.onclick()
            return 'pointer'
        }
        return null
    }

    // When released, keep cursor as pointer
    mouseUp(x,y){
        if (this.active && this.originX <= x && x <= this.originX + this.width && this.originY <= y && y <= this.originY + this.height){
            return 'pointer'
        }
        return null
    }

}