import { Color } from "../util/index.js"

const computerSETrans = document.getElementById('computerSETrans')
const computerSWTrans = document.getElementById('computerSWTrans')

export class PuzzleComputer {

    constructor({color = Color.black, dir = 'SE', x, y, text='1'}){
        Object.assign(this, {color, x, y, dir,text})
    }

    update(ctx,audio,mouse){
        if (this.dir == 'SE'){
            ctx.save()
            ctx.setTransform(30,-15, 0,18, this.x + 236, this.y + 273)
            Color.setColor(ctx, this.color)
            ctx.fillRect(0,0,1,1)
            Color.setColor(ctx, Color.white)
            ctx.font = '0.7px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(this.text,0.5,0)
            ctx.restore()
            ctx.drawImage(computerSETrans, this.x, this.y)
            
        }else if (this.dir == 'SW'){
            ctx.save()
            ctx.setTransform(30,15, 0,18, this.x + 246, this.y + 258)
            Color.setColor(ctx, this.color)
            ctx.fillRect(0,0,1,1)
            Color.setColor(ctx, Color.white)
            ctx.font = '0.7px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(this.text,0.5,0)
            ctx.restore()
            ctx.drawImage(computerSWTrans, this.x, this.y)
        }else{
            console.warn('invalid dir', this.dir)
        }
    }

}