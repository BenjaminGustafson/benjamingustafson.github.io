import {Color} from '../util/index.js'
/**
 * Traces a given function onto a grid
 * 
 * Not to be confused with IntegralTracer, which traces a function given slope input.
 *
 */

export class FunctionTracer {
    

    constructor({
        grid,
        fun = (x => 0), 
        color= Color.red,
        targets = [],
        xStep = 2,
        lineWidth = 10,
        solvable = false,
    }){
        Object.assign(this, {grid, fun, color, targets,
            xStep, lineWidth, solvable
        })

        this.display = true
        this.solved = false
    }
    

    update(ctx, audioManager, mouse){
        if (!this.display){
            return
        }

        this.targets.forEach(t => t.hit = false)
        Color.setColor(ctx, this.color)
        if (this.solved){
            Color.setColor(ctx, Color.blue)
        }
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        
        var cx = this.grid.canvasX
        var gx = this.grid.gridXMin
        var gy = this.fun(gx)
        var cy = this.grid.gridToCanvasBoundedY(gy).y
        var px = cx
        var py = cy
        ctx.moveTo(cx,cy);
        for (; cx < this.grid.canvasX + this.grid.canvasWidth; cx+=this.xStep){
            gx = this.grid.canvasToGridX(cx)
            gy = this.fun(gx)
            const cyb = this.grid.gridToCanvasBoundedY(gy)
            cy = cyb.y
            if (!cyb.out){
                ctx.lineTo(cx, cy);
            }else{
                ctx.moveTo(cx, cy);
            }
            // Check target collision
            this.targets.forEach(t => {
                if (t.lineIntersect(px,py,cx,cy) || t.pointIntersect(cx,cy)){
                    t.hit = true
                }
            })
            px = cx
            py = cy
        }
        ctx.stroke();       
        
        var targetsHit = true
        this.targets.forEach(t => {if (!t.hit) targetsHit = false })
        if (!this.solved && targetsHit){
            this.solved = true 
            audioManager.play('confirmation_001')
        }else if (this.solved && !targetsHit){
            this.solved = false
        }
    }

}