
/**
 * A GameObject to simplify drawing text.
 * 
 * See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
 */
class TextBox{

    constructor(originX,originY,content,font='40px sans-serif',color=Color.white, align='start',baseline='alphabetic'){
        this.originX = originX
        this.originY = originY
        this.content = content
        this.font = font
        this.align = align
        this.baseline = baseline
        this.color = color
    }

    update(ctx, audioManager, mouse){
        Color.setColor(ctx,this.color)
        ctx.font = this.font
        ctx.textAlign = this.align
        ctx.textBaseline = this.baseline
        ctx.fillText(this.content, this.originX, this.originY);
    }

}