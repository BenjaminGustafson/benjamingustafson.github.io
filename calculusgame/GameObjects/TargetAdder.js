import {Color, Shapes} from '../util/index.js'
import { Target } from './Target.js'

export class TargetAdder{


    constructor({
        grid,
        xPrecision = 1, 
        yPrecision = 1,
        solutionFun,
    }){
        Object.assign(this, {grid, xPrecision, yPrecision, solutionFun})
        this.targets = []
        this.active = true
        this.overGrid = false
        this.targetX = 0
        this.targetY = 0
        this.targetGY = 0
        this.targetGX = 0
        this.targetSize = 15

        this.clickedOn = false
    }   


    update(ctx, audioManager, mouse){

        this.mouseInput(mouse, audioManager)

        for (let i = 0; i < this.targets.length; i++){
            this.targets[i].update(ctx, audioManager, mouse)
        }
        if (this.overGrid){
            Color.setColor(ctx,Color.magenta)
            Shapes.Rectangle({ctx:ctx,originX:this.targetX-this.targetSize/2,originY:this.targetY-this.targetSize/2,
                width:this.targetSize,height:this.targetSize,fill:true, shadow:8, radius:2})

            ctx.font = 'bold 20px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            Color.setColor(ctx, Color.darkBlack)
            const str = '(' + this.targetGX +','+this.targetGY +')'
            const x = this.targetX+20
            const y = this.targetY-25
            Shapes.Rectangle({ctx:ctx, originX:x,originY:y , width:ctx.measureText(str).width, height:20, fill:true, shadow:8})
            Color.setColor(ctx,Color.magenta)
            ctx.fillText(str, x,y)
        }
    }

    mouseInput(mouse, audioManager){
        if (!this.active) return
        var x = mouse.x
        var y = mouse.y
        var g = this.grid
        var p = this.targetSize
        this.overGrid = x >= g.originX - p && x <= g.originX + g.canvasWidth +p && y >= g.originY-p && y <= g.originY + g.canvasHeight + p
        // If just outside border, snap to border
        if (x >= g.originX - p && x < g.originX){
            x = g.originX
        }else if (x <= g.originX + g.canvasWidth + p && x > g.originX + g.canvasWidth){
            x = g.originX + g.canvasWidth
        }
        if (y >= g.originY - p && y < g.originY){
            y = g.originY
        }else if (y <= g.originY + g.canvasHeight + p && y > g.originY + g.canvasHeight){
            y = g.originY + g.canvasHeight
        }
        if (this.overGrid){
            const gridCoord = g.canvasToGrid(x,y)
            const newTargetGX = Number((Math.round(gridCoord.x/this.xPrecision)*this.xPrecision).toFixed(6))
            const newTargetGY = Number((Math.round(gridCoord.y/this.yPrecision)*this.yPrecision).toFixed(6))
            if ((mouse.held && (newTargetGX != this.targetGX || newTargetGY != this.targetGY))){
                audioManager.play('click_001', this.targetGY/this.grid.gridHeight*6-6, 0.2)
            }
            this.targetGX = newTargetGX
            this.targetGY = newTargetGY
            this.targetX = g.gridToCanvasX(this.targetGX)
            this.targetY = g.gridToCanvasY(this.targetGY)
            mouse.cursor = "pointer"

            if (mouse.down){
                this.clickedOn = true
            }else if (this.clickedOn && mouse.up){
                this.clickedOn = false
                const newTargets = this.targets.filter(t => !(t.x == this.targetX && t.y == this.targetY))
                if (newTargets.length == this.targets.length){
                    if (this.solutionFun == null || Math.abs(this.solutionFun(this.targetGX) - this.targetGY) < this.yPrecision * 10){
                        var gy = this.targetGY
                        if (this.solutionFun != null)
                            gy = Number((Math.round(this.solutionFun(this.targetGX)/this.yPrecision)*this.yPrecision).toFixed(6))
                        audioManager.play('drop_003', this.targetGY/this.grid.gridHeight*12)
                        const target = new Target({grid:this.grid,gridX:this.targetGX, gridY: gy, size:this.targetSize})
                        this.targets.push(target)
                    }else {
                        audioManager.play('click2')
                    }

                }else{
                    audioManager.play('drop_001')
                    this.targets = newTargets
                }
            }
        }        
    }

}