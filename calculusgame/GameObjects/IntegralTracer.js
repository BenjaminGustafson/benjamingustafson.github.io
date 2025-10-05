import {Color, Shapes} from '../util/index.js'
import { FunctionTracer } from './FunctionTracer.js'
/**
 * 
 * 
 */
export class IntegralTracer extends FunctionTracer{
    
    constructor({
        // Required:
        grid, // the Grid object to draw on
        input, // either a preset, e.g. {type:'sliders', sliders:[]} Or {inputFunction, resetCondition, autoStart}
        ...options
    }){
        // The traced function is the integral of the inputFunction
        var inputFunction = null 
        var autoStart = true
        var resetCondition = null

        // Inputs
        switch (input.type){
            case 'comboSliders':{
                const sliders1 = input.sliders1
                const sliders2 = input.sliders2
                const spacing1 = input.spacing1 ? input.spacing1 : grid.gridWidth / sliders1.length
                const spacing2 = input.spacing2 ? input.spacing2 : grid.gridWidth / sliders2.length
                const combo = input.combo
                inputFunction = (x) => {
                    const sliderIndex1 = Math.floor((x - grid.gridXMin)/spacing1)
                    const sliderIndex2 = Math.floor((x - grid.gridXMin)/spacing2)
                    if (sliderIndex1 < 0 || sliderIndex1 >= sliders1.length) return 0
                    if (sliderIndex2 < 0 || sliderIndex2 >= sliders2.length) return 0
                    return combo(sliders1[sliderIndex1].value,sliders2[sliderIndex1].value)
                } 
                resetCondition = () => {
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
                const spacing = input.spacing ? input.spacing : grid.gridWidth / sliders.length
                inputFunction = (x) => {
                    const sliderIndex = Math.floor((x - grid.gridXMin)/spacing)
                    if (sliderIndex < 0 || sliderIndex >= sliders.length) return 0
                    return sliders[sliderIndex].value
                } 
                resetCondition = () => {
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
                inputFunction = (x) => {
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
                resetCondition = () => {
                    return !blockField.rootBlock || !blockField.rootBlock.toFunction()
                }
                autoStart = false
                break 
            case 'tracer':
                const tracer = input.tracer
                inputFunction = (x) => {
                    const tracerIndex = Math.round(tracer.grid.gridToCanvasX(x) - tracer.grid.canvasX)
                    if (tracerIndex < 0 || tracerIndex >= tracer.gridYs.length) return 0
                    return tracer.gridYs[tracerIndex]
                }
                resetCondition = (x) => {
                    return tracer.state != FunctionTracer.STOPPED_AT_END
                }

                break 
            case 'drawFunction':
                const drawFunction = input.drawFunction
                function helper (x) {
                    return drawFunction.outputFunction(x)
                }
                inputFunction = helper 
                // (x) => {
                //     drawFunction.outputFunction(x)
                // }
                resetCondition = () => {
                    return drawFunction.state == 'draw'
                }
                break
            default:
                inputFunction = input.inputFunction
                resetCondition = input.resetCondition
                autoStart = input.autoStart  
                break   
        }
        super({grid:grid, inputFunction:inputFunction, resetCondition:resetCondition, autoStart:autoStart, animated:true, ...options})
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

    outputY(gx){
        const cx = Math.round(this.grid.gridToCanvasX(gx))
        if (!this.grid.isInBoundsCanvasX(cx))
            return 0
        return this.gridYs[cx - this.grid.canvasX]
    }
}

