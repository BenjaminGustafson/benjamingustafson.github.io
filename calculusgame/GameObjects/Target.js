/**
 * A square target that can be hit by tracers.
 */
class Target{

    hit = false

    /**
     * 
     * @param {number} x center x value
     * @param {number} y center y value
     * @param {number} size sidelength of the square
     */
    constructor(origin_x,origin_y,size){
        this.unhit_color = Color.magenta
        this.hit_color = Color.blue
        this.size = size
        this.setPosition(origin_x,origin_y)
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

    draw(ctx){
        Color.setColor(ctx,this.hit ? this.hit_color : this.unhit_color)
        Shapes.Rectangle(ctx,this.left,this.top,this.size,this.size,this.size*0.5,true)
        
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