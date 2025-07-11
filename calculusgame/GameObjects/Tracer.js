/**
 * 
 * Traces the numeric integral of a given input
 * 
 * ISSUE: too high speed might miss targets
 */

class Tracer {
    frame = 0
    index = 0
    canvas_ys = []
    grid_ys = []
    solved_color = Color.blue
    unsolved_color = Color.red
    solved = false
    stopped = false
    doneTracing = false

    /**
     * 
     * @param {number} originX 
     * @param {number} originY 
     * @param {Grid} grid 
     * @param {*} input type: "sliders" or "mathBlock" or "tracer"
     * @param {*} frames_per_unit 
     * @param {*} targets 
     */
    constructor(originX, originY, grid, input, frames_per_unit, targets){
        this.originX = originX
        this.originY = originY
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
    
    /**
     * Sets the tracer back to the beginning
     */
    reset(){
        this.frame = 0
        this.index = 0
        this.targets.forEach(t => {
            t.hit = false
        })
        this.doneTracing = false
    }

    /**
     * Calculates the y-values for the tracer
     */
    calc_ys(){
        var canvas_ys = []
        var grid_ys = []

        var x = this.originX
        var y = this.originY

        if (this.type == "sliders"){
            var i = 0 // the slope index
            var slider_ind = 0
            while (x < this.originX + this.frame){
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
                var onGrid = true
                while (x < this.originX + this.frame && onGrid){
                    const gx = this.grid.canvasToGrid(x,0).x
                    const cy = y - fun(gx)
                    const gy = this.grid.canvasToGrid(0,cy).y
                    if (gy >= this.grid.grid_y_max){
                        onGrid = false
                    }
                    grid_ys.push(gy)
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
            while (x < this.originX + this.frame){
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


    getValue(){
        return this.grid_ys[this.grid_ys.length-1]
    }

    /**
     * 
     *  
     * 
     */
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

        var x = this.originX
        var y = this.originY
        var i = 0
        while (x < this.originX + this.frame){
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

        // Before we have drawn past the end of the grid, increment frames
        if (this.frame <= this.grid.width){
            if (!this.stopped){
                this.frame += this.frames_per_unit
            }
            this.doneTracing = false
        }else{ // After we reach the end, check if solved
            this.solved = true
            this.targets.forEach(t => {
                if (!t.hit){
                    this.solved = false
                }
            })
            this.doneTracing = true
        }
    }

}

