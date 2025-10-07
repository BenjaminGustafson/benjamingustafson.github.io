import {Color, Shapes} from '../util/index.js'
/**
 * 
 */

export class FunctionTracer {

    static STOPPED_AT_BEGINNING = 'STOPPED_AT_BEGINNING'
    static TRACING = 'TRACING'
    static AT_END = 'AT_END'
    static STOPPED_AT_END = 'STOPPED_AT_END'
    
    constructor({
        // Required:
        grid, // the Grid object to draw on
        inputFunction = x=>0, // the function to trace
        // Optional:
        animated = false, // if true the tracer draws from left to right, if false it draws all at once 
        resetCondition = () => false, // condition for starting over the trace
        autoStart = false, // start tracing whenever set at beginning 
        originGridX = grid.gridXMin, // where the tracer starts
        originGridY = 0,
        pixelsPerSec = 400, // number of pixels traced per real time
        precision = 0.001, // grid value increment
        targets = [], // targets that can be hit by the tracer
        lineWidth = 5, // width of the traced line
        unsolvedColor = Color.red, // color of the line when not solved
        solvedColor = Color.blue, // color of the line when solved (hit all targets)
        audioChannel = 0, // if using multiple tracers, use different audio channels so sounds can play simultaneously
        numLabel = true,
    }){
        Object.assign(this, {
            grid, originGridX, originGridY,
            pixelsPerSec, targets, lineWidth, precision, 
            unsolvedColor, solvedColor, audioChannel,
            animated, resetCondition, autoStart, 
            inputFunction, numLabel
        })

        this.originCanvasX = this.grid.gridToCanvasX(this.originGridX)
        this.originCanvasY = this.grid.gridToCanvasY(this.originGridY)      
        
        this.pixelIndex = this.grid.canvasWidth // Number of pixels from the start that the tracer is on.
        this.currentX = 0 // the current grid X-value
        this.currentY = 0 // the most recent y-value traced
        this.gridYs = [] // y-values for each traced pixel.
        
        this.solved = false // True if the tracer hits all targets
        this.tracerIndex = 0 // If input is tracer, the index of the tracer's input.
        this.startTime = Infinity // the Date.now() of when we started tracing

        // States
        
        this.state = FunctionTracer.STOPPED_AT_END
        this.selectedIndex = null

        this.reset()
    }


    setInputFunction(fun){
        this.inputFunction = fun
        this.reset()
    }
    
    /**
     * Calculates the y-values for the tracer
     */
    calculateYs(){
        this.gridYs = []
        for (let cx = this.grid.canvasX; cx <= this.grid.canvasX+this.grid.canvasWidth; cx ++){
            this.gridYs.push(this.inputFunction(this.grid.canvasToGridX(cx)))
        }
    }

    
    /**
     * Should be called internally whenever the input changes.
     * If animated, sets the tracer back to the beginning.
     */
    reset(){
        if (this.animated){
            this.solved = false
            this.targets.forEach(t => {
                t.hit = false
            })
            this.state = FunctionTracer.STOPPED_AT_BEGINNING
            this.pixelIndex = 0
            this.tracerIndex = 0
        }else{
            this.calculateYs() // TODO logic is confusing here, maybe combine reset with start()
        }
    }

    /**
     * Start tracing.
     */
    start(){
        if (this.state != FunctionTracer.STOPPED_AT_BEGINNING){
            this.reset()
        }
        this.state = FunctionTracer.TRACING
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
        if (this.state == FunctionTracer.STOPPED_AT_BEGINNING){
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

            // Draw label
            if (this.numLabel && ctx.isPointInStroke(mouse.x, mouse.y)){
                Shapes.Circle({ctx:ctx, centerX:x, centerY:cy, radius: this.lineWidth*1.5})
                ctx.save()
                const fontSize = 30
                ctx.font = `${fontSize}px monospace`
                const text = '(' + Number((Math.round(this.grid.canvasToGridX(this.grid.canvasX+i)*10)/10).toFixed(1)) 
                    + ',' + Number((Math.round(this.gridYs[i]*10)/10).toFixed(1)) + ')'
                const textWidth = ctx.measureText(text).width
                const labelPad = 5
                const labelRight = x - 10
                const labelBottom = cy - 10
                Color.setColor(ctx, Color.gray)
                Shapes.Rectangle({
                    ctx: ctx, 
                    originX: labelRight - labelPad * 2 - textWidth,
                    originY: labelBottom-fontSize,
                    width: textWidth + 20,
                    height: fontSize,
                    shadow: 8,
                })
                ctx.textAlign = 'right'
                ctx.textBaseline = 'middle'
                Color.setColor(ctx, Color.white)
                ctx.fillText(text,labelRight - labelPad, labelBottom-fontSize/2)
                ctx.restore()
            }


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
        if (this.state == FunctionTracer.TRACING){
            const elapsedTime = (Date.now() - this.startTime)/1000
            this.pixelIndex = Math.floor(this.pixelsPerSec * elapsedTime)
            // If we have reached the end
            if (this.pixelIndex >= this.grid.canvasWidth){
                this.pixelIndex = this.grid.canvasWidth
                this.state = FunctionTracer.AT_END
            }

        }
        else if (this.state == FunctionTracer.AT_END){
            this.state = FunctionTracer.STOPPED_AT_END
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

