/**
 * 
 * Traces the numeric integral of a given input
 * 
 * ISSUE: too high speed might miss targets
 * 
 * Depends on: Color.js, Shapes.js, Grid.js
 */

class IntegralTracer {
    

    /**
     * 
     * @param {object} config 
     * @param {} sliderSpacing - The distance between the sliders in grid coordinates
     */
    constructor({
        grid, gridX, gridY,
        sliders,
        mathBlockMngr,
        tracer,
        inputTracer,
        framesPerUnit = 4, 
        targets = [],
        lineWidth = 5
    }){
        Object.assign(this, {
            grid, gridX, gridY, sliders, mathBlockMngr, tracer, 
            framesPerUnit, targets, lineWidth
        })
        if (gridX == null){
            this.gridX = this.grid.gridXMin
        }
        if (gridY == null){
            this.gridY = 0
        }
        this.canvasX = this.grid.gridToCanvasX(this.gridX)
        this.canvasY = this.grid.gridToCanvasY(this.gridY)

        if (sliders != null){
            this.sliders = sliders
            this.type = 'sliders'
        }else if (mathBlockMngr != null){
            this.type = 'mathBlock'
            this.mathBlockMngr = mathBlockMngr
        }else if (inputTracer != null){
            this.type = 'tracer'
            this.inputTracer = inputTracer
        }else{
            throw new Error('Must provide sliders or mathBlockMngr or tracer')
        }

        // Dynamic vars
        this.frame = 0
        this.index = 0
        this.gridYs = [] // Indexed in pixels past start
        this.solved = false
        this.stopped = false
        this.doneTracing = false

        this.solvedColor = Color.blue
        this.unsolvedColor = Color.red
    }
    
    /**
     * Sets the tracer back to the beginning
     */
    reset(){
        this.frame = 0
        this.index = 0
        this.solved = false
        this.targets.forEach(t => {
            t.hit = false
        })
        this.doneTracing = false
    }

    /**
     * Given a grid x, return the grid y of the input function
     */
    inputGridY(gx){
        
        switch (this.type){
            case 'sliders':
                // Assuming sliders start from the left of the grid and are equally spaced
                const sliderSpacing = this.grid.gridWidth / this.sliders.length
                const sliderIndex = Math.floor((gx - this.grid.gridXMin)/sliderSpacing)
                if (sliderIndex < 0 || sliderIndex >= this.sliders.length) return 0
                return this.sliders[sliderIndex].value
            case 'mathBlock':
                if (!this.mathBlockMngr.field_block || !this.mathBlockMngr.field_block.toFunction()){
                    return 0
                }
                return this.mathBlockMngr.field_block.toFunction(gx)
            case 'tracer':
                const index = Math.round(this.inputTracer.grid.gridToCanvasX(gx) - this.inputTracer.grid.canvasX)
                if (index < 0 || index >= this.inputTracer.gridYs.length) return 0
                return this.inputTracer.gridYs[index]
        }
    }

    /**
     * Calculates the y-values for the tracer
     */
    calculateYs(){
        var newGridYs = []
        var gy = this.gridX // Accumulator
        
        for (let i = 0; i < this.frame; i++){
            const cx = this.canvasX + i
            const gx = this.grid.canvasToGridX(cx)
            gy += this.inputGridY(gx)/this.grid.xScale
            newGridYs.push(gy)
            if (Math.abs(newGridYs[i]-this.gridYs[i]) > 0.001){
                this.reset()
            }
        }

        this.gridYs = newGridYs
    }


    // getValue(){
    //     return this.gridYs[this.gridYs.length-1]
    // }

    draw(ctx){
        // If the mathblock is not defined, don't trace
        if (this.type == "mathBlock" && 
            (!this.mathBlockMngr.field_block || !this.mathBlockMngr.field_block.toFunction())){
            this.reset()
            return
        }

        this.calculateYs()

        Color.setColor(ctx, this.solved ? this.solvedColor : this.unsolvedColor)

        var x = this.canvasX
        var y = this.canvasY
        var i = 0
        while (x < this.canvasX + this.frame){
            const cyObj = this.grid.gridToCanvasBoundedY(this.gridYs[i])
            if (cyObj.out){
                x++
                i++
                continue
            }
            const cy = cyObj.y
            Shapes.Line(ctx,x,y, x+1, cy, this.lineWidth)
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
        if (this.frame < this.grid.canvasWidth){
            if (!this.stopped){
                this.frame += this.framesPerUnit
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

