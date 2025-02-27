/**
 * 
 * Traces the numeric integral of a given input
 * 
 * TODO: too high speed might miss targets
 */

class Tracer {
    frame = 0
    index = 0
    canvas_ys = []
    grid_ys = []
    solved_color = Color.blue
    unsolved_color = Color.red
    solved = false

    /**
     * 
     * @param {*} origin_x 
     * @param {*} origin_y 
     * @param {*} grid 
     * @param {*} input 
     * @param {*} frames_per_unit 
     * @param {*} targets 
     */
    constructor(origin_x, origin_y, grid, input, frames_per_unit, targets){
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.type = input.type
        if (input.type == "sliders"){
            this.sliders = input.sliders
            this.slider_spacing = input.slider_spacing
        }else if (input.type == "mathBlock"){
            this.mathBlockMngr = input.mathBlockMngr
        } if (input.type == "tracer"){
            this.source_tracer = input.source_tracer   
        }
        this.grid = grid
        this.scale = grid.width/grid.gridWidth
        this.frames_per_unit = frames_per_unit
        this.targets = targets
    }
    
    reset(){
        this.frame = 0
        this.index = 0
        this.targets.forEach(t => {
            t.hit = false
        })
    }

    calc_ys(){
        var canvas_ys = []
        var grid_ys = []

        var x = this.origin_x
        var y = this.origin_y

        if (this.type == "sliders"){
            var i = 0 // the slope index
            var slider_ind = 0
            while (x < this.origin_x + this.frame){
                const gx = this.grid.canvasToGrid(x,0).x
                const cy = y - this.sliders[slider_ind].value
                grid_ys.push(this.grid.canvasToGrid(0,cy).y)
                canvas_ys.push(cy)
                if (Math.abs(canvas_ys[i]-this.canvas_ys[i]) > 0.001){
                    this.reset()
                }
                y = cy
                x++
                i++
                if (i % this.slider_spacing < 1 && slider_ind < this.sliders.length-1){
                    slider_ind++
                }
            }
        }else if (this.type == "mathBlock"){
            if (this.mathBlockMngr.field_block && this.mathBlockMngr.field_block.toFunction()){
                const fun = this.mathBlockMngr.field_block.toFunction()
                var i = 0
                while (x < this.origin_x + this.frame){
                    const gx = this.grid.canvasToGrid(x,0).x
                    const cy = y - fun(gx)
                    grid_ys.push(this.grid.canvasToGrid(0,cy).y)
                    canvas_ys.push(cy)
                    if (Math.abs(canvas_ys[i]-this.canvas_ys[i]) > 0.001){
                        this.reset()
                    }
                    y = cy
                    x++
                    i++
                }
            }
        } else if (this.type == "tracer") {
            var i = 0
            while (x < this.origin_x + this.frame){
                const cy = y - this.source_tracer.grid_ys[i]
                canvas_ys.push(cy)
                grid_ys.push(this.grid.canvasToGrid(0,cy).y)
                if (Math.abs(canvas_ys[i]-this.canvas_ys[i]) > 0.001){
                    this.reset()
                }
                y = cy
                x++
                i++
            }
        }
        this.canvas_ys = canvas_ys
        this.grid_ys = grid_ys
        
    }

    draw(ctx){
        // If the mathblock is not defined, don't trace
        if (this.type == "mathBlock"
            && (!this.mathBlockMngr.field_block 
                || !this.mathBlockMngr.field_block.toFunction()))
        {
            this.reset()
        }

        // TODO: you don't have to calculate canvas_ys every time......
        this.calc_ys()

        ctx.strokeWidth = 10
        Color.setColor(ctx, this.solved ? this.solved_color : this.unsolved_color)

        var x = this.origin_x
        var y = this.origin_y
        var i = 0
        while (x < this.origin_x + this.frame){
            const cy = this.canvas_ys[i]
            Shapes.Line(ctx,x,y, x+1, cy, 5)
            this.targets.forEach(t => {
                if (t.lineIntersect(x,y,x+1,cy) || t.pointIntersect(x,y)){
                    t.hit = true
                }
            })
            y = cy
            x++
            i++
        }


        this.solved = true
        this.targets.forEach(t => {
            if (!t.hit){
                this.solved = false
            }
        })


        
        // Before we have drawn past the end of the grid, increment frames
        if (this.frame <= this.grid.width ){
            this.frame += this.frames_per_unit
        }
    }

}

