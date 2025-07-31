import {Color, Shapes} from '../util/index.js'
import { Target } from './Target.js'

export class TargetAdder{


    constructor({
        grid,
        precision=1
    }){
        Object.assign(this, {grid, precision})
        this.targets = []
        this.active = true
        this.overGrid = false
        this.targetX = 0
        this.targetY = 0
        this.targetGY = 0
        this.targetGX = 0
        this.targetSize = 15
    }   


    update(ctx, audioManager, mouse){

        this.mouseInput(mouse, audioManager)

        for (let i = 0; i < this.targets.length; i++){
            this.targets[i].update(ctx, audioManager, mouse)
        }
        if (this.overGrid){
            Color.setColor(ctx,Color.magenta)
            Shapes.Rectangle(ctx,this.targetX-this.targetSize/2,this.targetY-this.targetSize/2,
                this.targetSize,this.targetSize,this.targetSize*0.5,true)

            ctx.font = 'bold 20px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            Color.setColor(ctx, Color.black2)
            const str = '(' + this.targetGX +','+this.targetGY +')'
            const x = this.targetX+20
            const y = this.targetY-25
            Shapes.Rectangle(ctx, x,y , ctx.measureText(str).width, 20, 5,true)
            Color.setColor(ctx,Color.magenta)
            ctx.fillText(str, x,y)
        }
    }

    mouseInput(mouse, audioManager){
        if (!this.active) return
        const x = mouse.x
        const y = mouse.y
        const g = this.grid
        const p = this.targetSize
        this.overGrid = x >= g.originX - p && x <= g.originX + g.canvasWidth +p && y >= g.originY-p && y <= g.originY + g.canvasHeight + p
        if (this.overGrid){
            const gridCoord = g.canvasToGrid(x,y)
            this.targetGX = Math.round(gridCoord.x/this.precision)*this.precision
            this.targetGY = Math.round(gridCoord.y/this.precision)*this.precision
            this.targetX = g.gridToCanvasX(this.targetGX)
            this.targetY = g.gridToCanvasY(this.targetGY)
            mouse.cursor = "pointer"

            if (mouse.up){
                const newTargets = this.targets.filter(t => !(t.x == this.targetX && t.y == this.targetY))
                if (newTargets.length == this.targets.length){
                    audioManager.play('drop_003', this.targetGY/this.grid.gridHeight*12)
                    const target = new Target({grid:this.grid,gridX:this.targetGX, gridY:this.targetGY,size:this.targetSize})
                    this.targets.push(target)
                }else{
                    audioManager.play('drop_001')
                    this.targets = newTargets
                }
            }
        }        
    }

}