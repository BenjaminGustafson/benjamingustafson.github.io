import {Color, Shapes} from '../util/index.js'
/**
 * 
 * Traces the numeric integral of a given input
 * 
 * ISSUE: too high speed might miss targets. Would need to implemnet line-square intersection. 
 * 
 */

export class IntegralTracer {
    
    constructor({
        // Required:
        grid, // the Grid object to draw on
        input, // either a preset, e.g. {type:'sliders', sliders:[]} Or {inputFunction, resetCondition, autoStart}
        // Optional:
        originGridX = grid.gridXMin, // where the tracer starts
        originGridY = 0,
        pixelsPerSec = 400, // number of pixels traced per real time
        precision = 0.001, // grid value increment
        targets = [], // targets that can be hit by the tracer
        lineWidth = 5, // width of the traced line
        unsolvedColor = Color.red, // color of the line when not solved
        solvedColor = Color.blue, // color of the line whne solved (hit all targets)
        audioChannel = 0, // if using multiple tracers, use different audio channels so sounds can play simultaneously
    }){
        Object.assign(this, {
            grid, originGridX, originGridY,
            pixelsPerSec, targets, lineWidth, precision, 
            unsolvedColor, solvedColor, audioChannel,
        })

        this.originCanvasX = this.grid.gridToCanvasX(this.originGridX)
        this.originCanvasY = this.grid.gridToCanvasY(this.originGridY)      
        
        this.pixelIndex = 0 // Number of pixels from the start that the tracer is on.
        this.currentX = 0 // the current grid X-value
        this.currentY = 0 // the most recent y-value traced
        this.gridYs = [] // y-values for each traced pixel.
        
        this.solved = false // True if the tracer hits all targets
        this.tracerIndex = 0 // If input is tracer, the index of the tracer's input.
        this.startTime = Infinity // the Date.now() of when we started tracing

        // States
        this.STOPPED_AT_BEGINNING = 0
        this.TRACING = 1
        this.AT_END = 2
        this.STOPPED_AT_END = 3
        this.state = this.STOPPED_AT_BEGINNING
         
        this.reset()

        this.autoStart = true

        // Inputs
        switch (input.type){
            case 'comboSliders':{
                const sliders1 = input.sliders1
                const sliders2 = input.sliders2
                const spacing1 = input.spacing1 ? input.spacing1 : this.grid.gridWidth / sliders1.length
                const spacing2 = input.spacing2 ? input.spacing2 : this.grid.gridWidth / sliders2.length
                const combo = input.combo
                this.inputFunction = (x) => {
                    const sliderIndex1 = Math.floor((x - this.grid.gridXMin)/spacing1)
                    const sliderIndex2 = Math.floor((x - this.grid.gridXMin)/spacing2)
                    if (sliderIndex1 < 0 || sliderIndex1 >= sliders1.length) return 0
                    if (sliderIndex2 < 0 || sliderIndex2 >= sliders2.length) return 0
                    return combo(sliders1[sliderIndex1].value,sliders2[sliderIndex1].value)
                } 
                this.resetCondition = () => {
                    for (let i = 0; i < sliders1.length; i++){
                        if (sliders1[i].grabbed || sliders1[i].mouseValue != sliders1[i].value){
                            return true
                        }
                    }
                    for (let i = 0; i < sliders2.length; i++){
                        if (sliders2[i].grabbed || sliders2[i].mouseValue != sliders2[i].value){
                            return true
                        }
                    }
                    return false
                }
            }
                break
            case 'sliders':
                const sliders = input.sliders
                const spacing = input.spacing ? input.spacing : this.grid.gridWidth / sliders.length
                this.inputFunction = (x) => {
                    const sliderIndex = Math.floor((x - this.grid.gridXMin)/spacing)
                    if (sliderIndex < 0 || sliderIndex >= sliders.length) return 0
                    return sliders[sliderIndex].value
                } 
                this.resetCondition = () => {
                    for (let i = 0; i < sliders.length; i++){
                        if (sliders[i].grabbed || sliders[i].mouseValue != sliders[i].value){
                            return true
                        }
                    }
                    return false
                }
                break
            case 'mathBlock':
                const blockField = input.blockField
                this.inputFunction = (x) => {
                    if (blockField.rootBlock){
                        // Slight inneficiency here, since we build the function for every call. 
                        const fun = blockField.rootBlock.toFunction()
                        if (fun != null){
                            return fun(x)
                        }
                    }
                    console.warn('Invalid root block')
                    return 0
                }
                this.resetCondition = () => {
                    return !blockField.rootBlock || !blockField.rootBlock.toFunction()
                }
                this.autoStart = false
                break 
            case 'tracer':
                const tracer = input.tracer
                this.inputFunction = (x) => {
                    const tracerIndex = Math.round(tracer.grid.gridToCanvasX(x) - tracer.grid.canvasX)
                    if (tracerIndex < 0 || tracerIndex >= tracer.gridYs.length) return 0
                    return tracer.gridYs[tracerIndex]
                }
                this.resetCondition = (x) => {
                    return tracer.state != this.STOPPED_AT_END // == this.STOPPED_AT_BEGINNING
                }

                break 
            case 'drawFunction':
                const drawFunction = input.drawFunction
                this.inputFunction = (x) => {
                    drawFunction.outputFunction(gx)
                }
                this.resetCondition = (x) => {
                    return drawFunction.state == 'draw'
                }
                break
            default:
                this.inputFunction = input.inputFunction
                this.resetCondition = input.resetCondition
                this.autoStart = input.autoStart  
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
            gy += this.inputFunction(gx) * this.precision
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
        // Calculate current coords
        this.currentX = this.grid.canvasToGridX(this.originCanvasX + this.pixelIndex)
        if (this.gridYs[this.pixelIndex] != null){
            this.currentY = this.gridYs[this.pixelIndex]
            if (this.pixelIndex > 0)
                this.currentDelta = this.gridYs[this.pixelIndex] - this.gridYs[this.pixelIndex-1]
            else
                this.currentDelta = 1
        }

        // Check if we need to reset
        if (this.resetCondition()){
            this.reset()
            return
        }

        // Check if we need to start tracing
        if (this.state == this.STOPPED_AT_BEGINNING){
            if (this.autoStart)
                this.start()
            else
                return
        } 

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
                            audioManager.play('drop_002',{pitch:this.gridYs[i-1]/this.grid.gridHeight*12, channel:this.audioChannel})
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
                audioManager.play('confirmation_001', {channel:this.audioChannel, pitch:-7*this.audioChannel})
            }
        }
    }

}

