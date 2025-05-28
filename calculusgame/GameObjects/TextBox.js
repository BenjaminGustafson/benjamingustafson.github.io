
/**
 * Why do we have a wrapper class for a function built into canvas?
 * Because it needs to be a gameobject.
 * 
 * Is there a better option?
 * Maybe. The issue is that the scenes do not access the context. 
 * Each game object in a scene gets access to the context when 
 * it needs to be drawn. 
 * 
 * See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
 */
class TextBox{

    constructor(origin_x,origin_y,content,font='40px sans-serif',color=Color.white, align='start',baseline='alphabetic'){
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.content = content
        this.font = font
        this.align = align
        this.baseline = baseline
        this.color = color
    }

    draw(ctx){
        Color.setColor(ctx,this.color)
        ctx.font = this.font
        ctx.textAlign = this.align
        ctx.textBaseline = this.baseline
        ctx.fillText(this.content, this.origin_x, this.origin_y);
    }

}