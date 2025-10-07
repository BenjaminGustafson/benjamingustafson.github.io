import {Color, Shapes} from '../util/index.js'
/**
 * A square target that can be hit by tracers.
 */
export class Target{


    constructor({
        canvasX,canvasY,
        grid,gridX,gridY,
        size=15, 
        unhitColor = Color.magenta,
    }){
        Object.assign(this, {unhitColor})
        this.grid = grid
        this.size = size
        if (canvasX != null && canvasY != null){
            this.setPosition(canvasX,canvasY)
        }else if (grid != null && gridX != null && gridY != null){
            const canvasCoord = grid.gridToCanvas(gridX, gridY)
            this.setPosition(canvasCoord.x, canvasCoord.y)
        } else {
            throw new Error("Must provide either (canvasX, canvasY) or (grid, gridX, gridY)")
        }
        this.hitColor = Color.blue
        this.hit = false
    }

    /**
     * Sets the center of the target to the given (x,y).
     * Use this rather than directly setting target.x or .y.
     */
    setPosition(x,y){
        this.x = x
        this.y = y
        this.left = this.x-this.size/2
        this.right = this.x+this.size/2
        this.top = this.y-this.size/2
        this.bottom = this.y+this.size/2
    }

    setGridYPosition(y){
        this.setPosition(this.x, this.grid.gridToCanvasBoundedY(y).y)
    }

    update(ctx, audioManager, mouse){
        Color.setColor(ctx,this.hit ? this.hitColor : this.unhitColor)
        Shapes.Rectangle({ctx:ctx,originX:this.left,originY:this.top,width:this.size,height:this.size, radius: 2})
    }

    /**
     * Given a point (x,y) is the point in the target.
     */
    pointIntersect(x,y){
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
    }

    /**
     * 
     * Given a line segment (x1,y1) to (x2,y2), checks if this box intersects it.
     * 
     *    l   r
     *    |   |
     * ---|---|--- top
     *    |   |         y
     * ---|---|--- bot
     *    |   |
     *      x
     * Find left intersect:
     *      Solve for t in
     *      x1*(1-t) + x2*t = left
     *      x1 - x1 t + x2 t = left
     *      t (x2 - x1) = left - x1
     *      plug into y eq and check if top <= y <= bot
     * Same for right
     * Same for top
     */
    lineIntersect(x1, y1, x2, y2){
        if (x2 == x1){
            return false
        }

        // TODO: find a more pixel-accurate way to do this...
        const tolerance = 5
        // Allows the center of the line to be off by 
        const t_left = (this.left - x1)/(x2 - x1)
        if (0 <= t_left && t_left <= 1){
            const y_left = y1*(1-t_left) + y2*t_left
            if (y_left >= this.top-tolerance && y_left <= this.top+tolerance){
                return true
            }
        }

        const t_right = (this.right - x1)/(x2 - x1)
        if (0 <= t_right && t_right  <= 1){
            const y_right = y1*(1-t_right) + y2*t_right
            if (y_right >= this.top-tolerance && y_right <= this.top+tolerance){
                return true
            }
        }

        const t_top = (this.top - y1)/(y2 - y1)
        if (0 <= t_top && t_top <= 1){
            const x_top = x1*(1-t_top) + x2*t_top
            if (x_top >= this.left-tolerance && x_top <= this.right+tolerance){
                return true
            }
        }

        const t_bottom = (this.bottom - y1)/(y2 - y1)
        if (0 <= t_bottom && t_bottom <= 1){
            const x_bottom = x1*(1-t_bottom) + x2*t_bottom
            if (x_bottom >= this.left-tolerance && x_bottom <= this.right+tolerance){
                return true
            }
        }

        return false
    }
}