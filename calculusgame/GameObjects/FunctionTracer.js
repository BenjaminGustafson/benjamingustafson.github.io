/**
 * Traces a given function onto a grid
 * 
 * Not to be confused with Tracer, which traces a function given slope input.
 *
 */

class FunctionTracer {
    frame = 0
    index = 0
    display = true

    constructor(grid, fun = (x => 0)){
        this.grid = grid
        this.fun = fun
        this.originX = grid.originX
        this.max_x = grid.originX + grid.width
        this.min_y = grid.originY
        this.max_y = grid.originY + grid.height
        this.color = Color.red
        this.x_step = 2

    }
    

    draw(ctx){
        if (this.display){

            Color.setColor(ctx, this.color)
            ctx.strokeWidth = 10;
            ctx.beginPath();
            
            var cy = this.grid.gridToCanvas(this.fun(this.grid.canvasToGrid(this.originX,0).x))
            var cx = this.originX
            ctx.moveTo(cx,cy);
            for (; cx < this.max_x; cx+=this.x_step){
                const gx = this.grid.canvasToGrid(cx,0).x
                const gy = this.fun(gx)
                const cy = this.grid.gridToCanvas(0,gy).y
                if (cy <= this.max_y && cy >= this.min_y){
                    ctx.lineTo(cx, cy);
                }else{
                    ctx.moveTo(cx, cy);
                }
            }
            ctx.stroke();       
        }
    }

}