import {Color, Shapes} from '../util/index.js'
/**
 * 
 * Traces the numeric integral of a given input
 * 
 * ISSUE: too high speed might miss targets
 * 
 * Depends on: Color.js, Shapes.js, Grid.js
 */

export class IntegralTracer {
    

    /**
     * 
     * @param {object} config 
     * @param {} sliderSpacing - The distance between the sliders in grid coordinates
     */
    constructor({
        grid, gridX, gridY,
        sliders = [],
        blockField,
        tracer,
        inputTracer,
        pixelsPerSec = 100, 
        precision = 0.001,
        targets = [],
        lineWidth = 5,
        autoCalculate = true,
    }){
        Object.assign(this, {
            grid, gridX, gridY, sliders, blockField, tracer, 
            pixelsPerSec, targets, lineWidth, precision, autoCalculate
        })
        if (gridX == null){
            this.gridX = this.grid.gridXMin
        }
        if (gridY == null){
            this.gridY = 0
        }
        this.canvasX = this.grid.gridToCanvasX(this.gridX)
        this.canvasY = this.grid.gridToCanvasY(this.gridY)

        if (this.sliders.length > 0){
            this.sliders = sliders
            this.type = 'sliders'
        }else if (blockField != null){
            this.type = 'mathBlock'
            this.blockField = blockField
        }else if (inputTracer != null){
            this.type = 'tracer'
            this.inputTracer = inputTracer
        }else{
            throw new Error('Must provide sliders or blockField or tracer')
        }

        // Dynamic vars
        this.pixel = 0
        this.index = 0
        this.gridYs = [] // Indexed in pixels past start
        this.solved = false
        this.stopped = false
        this.doneTracing = false
        this.currentValue = 0
        this.currentX = 0

        this.solvedColor = Color.blue
        this.unsolvedColor = Color.red

        this.recalculate = false
        this.reset()
        this.startTime = Infinity
    }
    
    /**
     * Sets the tracer back to the beginning
     */
    reset(){
        this.pixel = 0
        this.index = 0
        this.solved = false
        this.targets.forEach(t => {
            t.hit = false
        })
        this.doneTracing = false
        this.recalculate = true
        this.startTime = Date.now()
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
                if (!this.blockField.rootBlock || !this.blockField.rootBlock.toFunction()){
                    console.warn('Invalid root block')
                    return 0
                }
                return this.blockField.rootBlock.toFunction()(gx)
            case 'tracer':
                const index = Math.round(this.inputTracer.grid.gridToCanvasX(gx) - this.inputTracer.grid.canvasX)
                if (index < 0 || index >= this.inputTracer.gridYs.length) return 0
                return this.inputTracer.gridYs[index]
        }
    }

    /**
     * Calculates the y-values for the tracer
     * 
     * TODO: optimally, we would only recaculate the integral when there has been a change in input...
     */
    calculateYs(){
        var newGridYs = [this.gridY] // Grid y-values for each pixel
        var gy = this.gridY // Accumulated grid y-value
        var gyPrev = this.gridY
        var cxPixel = this.canvasX + 1 // Canvas x of the next pixel to be added to the array

        for (let gx = this.grid.gridXMin; gx <= this.grid.gridXMax; gx += this.precision){
            //if (cxPixel - this.canvasX > this.canvasX + this.pixel) break
            gy += this.inputGridY(gx) * this.precision
            const cxPrecise = this.grid.gridToCanvasX(gx)
            if (cxPrecise >= cxPixel){
                const prevCxPrecise = this.grid.gridToCanvasX(gx-this.precision)
                const t = (cxPixel - prevCxPrecise) / (cxPrecise - prevCxPrecise) 
                newGridYs.push( t * gyPrev + (1-t) * gy)
                cxPixel++
            }
            gyPrev = gy
        }
        

        // Old version
        // for (let i = 0; i < this.pixel; i++){
        //     const cx = this.canvasX + i
        //     const gx = this.grid.canvasToGridX(cx)
        //     gy += this.inputGridY(gx)/this.grid.xScale
        //     newGridYs.push(gy)
        //     if (Math.abs(newGridYs[i]-this.gridYs[i]) > 0.001){
        //         this.reset()
        //     }
        // }

        this.gridYs = newGridYs
        this.recalculate = false
    }

    start(){
        this.calculateYs()
        this.stopped = false
        this.startTime = Date.now()
    }

    stop(){
        this.stopped = true
    }

    update(ctx, audioManager, mouse){
        this.currentX = this.grid.canvasToGridX(this.canvasX + this.pixel)
        if (this.gridYs[this.pixel] != null){
            this.currentValue = this.gridYs[this.pixel]
            if (this.pixel > 0)
                this.currentDelta = this.gridYs[this.pixel] - this.gridYs[this.pixel-1]
            else
                this.currentDelta = 1
        }
        // If the mathblock is not defined, don't trace
        if (this.type == "mathBlock" && 
            (!this.blockField.rootBlock || !this.blockField.rootBlock.toFunction())){
            this.reset()
            return
        } else if (this.type == "sliders"){
            for (let i = 0; i < this.sliders.length; i++){
                if (this.sliders[i].grabbed){
                    this.reset()
                    return
                }
            }
            if (this.pixel == 0){
                this.start()
            }
        }

        Color.setColor(ctx, this.solved ? this.solvedColor : this.unsolvedColor)

        var x = this.canvasX
        var cyObj = this.grid.gridToCanvasBoundedY(this.gridYs[0])
        var prevCy = cyObj.y
        var prevOob = cyObj.out
        var i = 1
        while (x < this.canvasX + this.pixel){
            cyObj = this.grid.gridToCanvasBoundedY(this.gridYs[i])
            const cy = cyObj.y
            if (cyObj.out){
                x++
                i++
                prevCy = cy
                if (x == this.canvasX + this.pixel-1 && !this.doneTracing){
                    // Draw an indicator that we are out of bounds
                    Shapes.Line(ctx, x, cy, x, cy, this.lineWidth*2)
                }
                // If we have 2 out of bounds in a row, do not draw the line
                if (prevOob){ 
                    continue
                }
            }
            Shapes.Line(ctx,x, prevCy, x+1, cy, this.lineWidth)
            this.targets.forEach(t => {
                if (t.lineIntersect(x,prevCy,x+1,cy) || t.pointIntersect(x,prevCy)){
                    if (!t.hit){
                        audioManager.play('drop_002',this.gridYs[i-1]/this.grid.gridHeight*12)
                    }
                    t.hit = true
                }
            })
            prevCy = cy
            x++
            i++
            prevOob = cyObj.out
        }
        

        

        // Before we have drawn past the end of the grid, increment frames
        if (this.pixel < this.grid.canvasWidth){
            if (!this.stopped){
                const elapsedTime = (Date.now() - this.startTime)/1000
                this.pixel = Math.floor(this.pixelsPerSec * elapsedTime)
            }
            this.doneTracing = false
        }else{ // After we reach the end, check if solved
            this.pixel = this.grid.canvasWidth
            if (!this.doneTracing){ // First time only
                this.solved = true
                this.targets.forEach(t => {
                    if (!t.hit){
                        this.solved = false
                    }
                })
                if (this.solved){
                    audioManager.play('confirmation_001')
                }
            }
            this.doneTracing = true
        }
    }

}

