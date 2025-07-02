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
     * @param {number} origin_x x-value of left of button rectangle 
     * @param {number} origin_y y-value of top of button rectangle
     * @param {number} width
     * @param {number} height 
     * @param {Function} onclick function that is called when button is clicked
     * @param {string} label the text to go in the button
     */
    constructor(origin_x, origin_y, width, height, onclick, label){
        this.origin_x = origin_x
        this.origin_y = origin_y
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
        Shapes.Rectangle(ctx,this.origin_x,this.origin_y,this.width,this.height,10)
        ctx.font = "40px monospace"
        ctx.textBaseline = 'alphabetic'
        ctx.textAlign = 'start'
        var text_size = ctx.measureText(this.label)
        // Adjust to fit inside label
        const font_size = Math.min(40 * this.width / text_size.width * 0.8 - 10, 40)
        ctx.font = font_size + "px monospace"
        text_size = ctx.measureText(this.label)
        // text baseline = top + half of height + half of font...
        ctx.fillText(this.label, this.origin_x + this.width/2-text_size.width/2, this.origin_y + this.height/2 + text_size.actualBoundingBoxAscent/2)
    }

    // When mouse is over button, change cursor to pointer
    mouseMove(x,y){
        if (this.active && this.origin_x <= x && x <= this.origin_x + this.width && this.origin_y <= y && y <= this.origin_y + this.height){
            return 'pointer'
        }
        return null
    }

    // When clicked, call the onclick method
    mouseDown(x,y){
        if (this.active && this.origin_x <= x && x <= this.origin_x + this.width && this.origin_y <= y && y <= this.origin_y + this.height){
            this.onclick()
            return 'pointer'
        }
        return null
    }

    // When released, keep cursor as pointer
    mouseUp(x,y){
        if (this.active && this.origin_x <= x && x <= this.origin_x + this.width && this.origin_y <= y && y <= this.origin_y + this.height){
            return 'pointer'
        }
        return null
    }

}