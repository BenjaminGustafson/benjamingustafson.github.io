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
     * @param {} this.spacing - The distance between the sliders in grid coordinates
     */
    constructor({
        grid, originGridX, originGridY,
        sliders = [],
        blockField,
        inputTracer,
        drawFunction,
        pixelsPerSec = 400, 
        precision = 0.001,
        targets = [],
        lineWidth = 5,
        spacing,
    }){
        Object.assign(this, {
            grid, originGridX, originGridY, sliders, blockField,
            pixelsPerSec, targets, lineWidth, precision, spacing
        })
        if (originGridX == null){
            this.originGridX = this.grid.gridXMin
        }
        if (originGridY == null){
            this.originGridY = 0
        }
        this.originCanvasX = this.grid.gridToCanvasX(this.originGridX)
        this.originCanvasY = this.grid.gridToCanvasY(this.originGridY)

        if (this.sliders.length > 0){
            this.sliders = sliders
            this.type = 'sliders'
            if (this.spacing == null){
                this.spacing = this.grid.gridWidth / this.sliders.length
            }
        }else if (blockField != null){
            this.type = 'mathBlock'
            this.blockField = blockField
        }else if (inputTracer != null){
            this.type = 'tracer'
            this.inputTracer = inputTracer
        }else if (drawFunction != null){
            this.type = 'drawFunction'
            this.drawFunction = drawFunction
        }else {
            throw new Error('Must provide an input method: sliders, blockField, tracer, drawFunction')
        }

        // Dynamic vars
        /**
         * The number of pixels from the start that the tracer is on.
         */
        this.pixelIndex = 0
        
        /**
         * The y value corresponding to each traced pixel.
         */
        this.gridYs = []

        /**
         * True if the tracer hits all targets. Turns the color blue.
         */
        this.solved = false

        /**
         * Tracer has 3 states:
         */
        this.STOPPED_AT_BEGINNING = 0
        this.TRACING = 1
        this.STOPPED_AT_END = 2
        this.AT_END = 3
        this.state = this.STOPPED_AT_BEGINNING

        /**
         * The most recent value traced. 
         * Gives the start or end value if the tracer is stopped.
         */
        this.currentValue = 0

        /**
         * The current grid X-value.
         */
        this.currentX = 0

        /**
         * If input is tracer, the index of the tracer's input.
         */
        this.tracerIndex = 0

        this.solvedColor = Color.blue
        this.unsolvedColor = Color.red

        /**
         * Flag for 
         */
        this.recalculate = false

        this.reset()
        this.startTime = Infinity
    }
    

    /**
     * Given a grid x, return the grid y of the input function
     */
    inputGridY(gx){
        switch (this.type){
            case 'sliders':
                const sliderIndex = Math.floor((gx - this.grid.gridXMin)/this.spacing)
                if (sliderIndex < 0 || sliderIndex >= this.sliders.length) return 0
                return this.sliders[sliderIndex].value
            case 'mathBlock':
                if (!this.blockField.rootBlock || !this.blockField.rootBlock.toFunction()){
                    console.warn('Invalid root block')
                    return 0
                }
                return this.blockField.rootBlock.toFunction()(gx)
            case 'tracer':
                const tracerIndex = Math.round(this.inputTracer.grid.gridToCanvasX(gx) - this.inputTracer.grid.canvasX)
                if (tracerIndex < 0 || tracerIndex >= this.inputTracer.gridYs.length) return 0
                return this.inputTracer.gridYs[tracerIndex]
            case 'drawFunction':
                return this.drawFunction.outputFunction(gx)
                break 
        }
    }

    /**
     * Calculates the y-values for the tracer
     */
    calculateYs(){
        var newGridYs = [this.originGridY] // Grid y-values for each pixel
        var gy = this.originGridY // Accumulated grid y-value
        var gyPrev = this.originGridY
        var cxPixel = this.originCanvasX + 1 // Canvas x of the next pixel to be added to the array

        for (let gx = this.grid.gridXMin; gx <= this.grid.gridXMax+1; gx += this.precision){
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

        this.gridYs = newGridYs
    }

    
    /**
     * Sets the tracer back to the beginning.
     * Should be called internally whenever the input changes.
     */
    reset(){
        this.state = this.STOPPED_AT_BEGINNING
        this.pixelIndex = 0
        this.tracerIndex = 0
        this.solved = false
        this.targets.forEach(t => {
            t.hit = false
        })
    }

    /**
     * Start tracing.
     */
    start(){
        if (this.state != this.STOPPED_AT_BEGINNING){
            this.reset()
        }
        this.state = this.TRACING
        this.calculateYs()
        this.startTime = Date.now()
    }

    update(ctx, audioManager, mouse){

        //console.log(this.state, this.currentX, this.pixelIndex, this.currentValue)

        this.currentX = this.grid.canvasToGridX(this.originCanvasX + this.pixelIndex)
        if (this.gridYs[this.pixelIndex] != null){
            this.currentValue = this.gridYs[this.pixelIndex]
            if (this.pixelIndex > 0)
                this.currentDelta = this.gridYs[this.pixelIndex] - this.gridYs[this.pixelIndex-1]
            else
                this.currentDelta = 1
        }

        // If the mathblock is not defined, reset
        if (this.type == "mathBlock" && 
            (!this.blockField.rootBlock || !this.blockField.rootBlock.toFunction())){
            this.reset()
            return
        } 
        // If sliders are grabbed, reset
        else if (this.type == "sliders"){
            for (let i = 0; i < this.sliders.length; i++){
                if (this.sliders[i].grabbed || this.sliders[i].mouseValue != this.sliders[i].value){
                    this.reset()
                    return
                }
            }
            // If no sliders are grabbed, start tracing
            if (this.state == this.STOPPED_AT_BEGINNING)
                this.start()
        }else if (this.type == 'drawFunction'){
            if (this.drawFunction.state == 'draw'){
                this.reset()
                return
            }
            if (this.state == this.STOPPED_AT_BEGINNING)
                this.start()
        }else if (this.type == 'tracer'){
            if (this.inputTracer.state != this.STOPPED_AT_END){ // == this.STOPPED_AT_BEGINNING){
                this.reset()
                return
            } else if (this.state == this.STOPPED_AT_BEGINNING){
                this.start()
            }

        }

        if (this.state == this.STOPPED_AT_BEGINNING) return


        Color.setColor(ctx, this.solved ? this.solvedColor : this.unsolvedColor)

        var cyObj = this.grid.gridToCanvasBoundedY(this.gridYs[0])
        var prevCy = cyObj.y
        var prevOob = cyObj.out

        // i = the index of the current pixel in gridYs to draw
        for (let i = 1; i <= this.pixelIndex; i++){
            // x = the canvas value of the current pixel
            var x = this.originCanvasX+i
            
            cyObj = this.grid.gridToCanvasBoundedY(this.gridYs[i])
            const cy = cyObj.y

            // Out of bounds
            if (cyObj.out){
                if (x == this.originCanvasX + this.pixelIndex-1 && !this.doneTracing){
                    // Draw an indicator that we are out of bounds
                    Shapes.Line(ctx, x, cy, x, cy, this.lineWidth*2)
                }
                // If we have 2 out of bounds in a row, do not draw the line
                if (prevOob){
                    prevCy = cy
                    continue
                }
            }

            //Draw line
            Shapes.Line(ctx,x-1, prevCy, x, cy, this.lineWidth)

            // Check if line hit targets on last iteration
            if (!cyObj.out){ //i == this.pixelIndex && 
                this.targets.forEach(t => {
                    if (t.lineIntersect(x,prevCy,x+1,cy) || t.pointIntersect(x,prevCy)){
                        if (!t.hit){
                            audioManager.play('drop_002',this.gridYs[i-1]/this.grid.gridHeight*12)
                        }
                        t.hit = true
                    }
                })
            }
                
            // Set vars for next iter
            prevCy = cy
            prevOob = cyObj.out
        }

        // Before we have drawn past the end of the grid, increment frames
        if (this.state == this.TRACING){
            const elapsedTime = (Date.now() - this.startTime)/1000
            this.pixelIndex = Math.floor(this.pixelsPerSec * elapsedTime)
            // If we have reached the end
            if (this.pixelIndex >= this.grid.canvasWidth){
                this.pixelIndex = this.grid.canvasWidth
                this.state = this.AT_END
            }
        }
        else if (this.state == this.AT_END){
            this.state = this.STOPPED_AT_END
            // Check if solved
            this.solved = true
            if (this.targets.length == 0) this.solved = false
            var i = 0
            this.targets.forEach(t => {
                if (!t.hit){
                    this.solved = false
                }
            })
            if (this.solved){
                audioManager.play('confirmation_001')
            }
        }
    }

}

