import {Color} from '../util/index.js'
/**
 * A GameObject to simplify drawing text.
 * 
 * See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
 */
export class TextBox{

    constructor({
        originX,originY,
        content="",
        font='20px monospace',
        color=Color.white,
        align='start',
        baseline='alphabetic'
    }){
        Object.assign(this, {
            originX, originY, content, font, color, align, baseline
        })
    }

    update(ctx, audioManager, mouse){
        Color.setColor(ctx,this.color)
        ctx.font = this.font
        ctx.textAlign = this.align
        ctx.textBaseline = this.baseline
        ctx.fillText(this.content, this.originX, this.originY);
    }

}