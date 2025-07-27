/**
 * A slider UI element.
 * 
 * Drawn as a line with tick marks and a circle that can be dragged along the line.
 * 
 */
class Slider{

    /**
     * 
     * @param {Object} config
     * @param {number} config.canvasX - x-coordinate (left if horizontal)
     * @param {number} config.canvasY - y-coordinate (top if vertical)
     * @param {number} config.canvasLength - The length in pixels 
     * @param {number} config.sliderLength - The length in slider value 
     * 
     */
    constructor({
        canvasX, canvasY,
        grid, gridPos,
        minValue, maxValue,
        canvasLength = 400,
        sliderLength = 4,
        startValue = 0,
        increment = 0.1,
        circleRadius=15,
        vertical = true,
        showLines = true, 
        showAxis = false,
        circleColor = Color.red,
        lineWidth = 5
    }){
        Object.assign(this, {
            canvasLength, sliderLength, startValue, increment, circleRadius,
            vertical, showLines, showAxis, circleColor, lineWidth  
        })

        if (canvasX != null && canvasY != null){
            this.canvasX = canvasX
            this.canvasY = canvasY

            if (maxValue != null){
                this.maxValue = maxValue
                this.minValue = maxValue - sliderLength
            }else if (minValue != null){
                this.minValue = minValue
                this.maxValue = minValue + sliderLength
            }else { // default to center slider
                this.minValue = - Math.floor(sliderLength/2)
                this.maxValue = Math.ceil(sliderLength/2)
            }
    
        }else if (grid != null && gridPos != null){
            this.showLines = false
            if (vertical){
                this.canvasX = grid.gridToCanvasX(gridPos)
                this.canvasY = grid.canvasY
                this.canvasLength = grid.canvasHeight
                this.sliderLength = grid.gridHeight
                this.maxValue = grid.gridYMax
                this.minValue = grid.gridYMin
            }else{
                this.canvasX = grid.canvasX
                this.canvasY = grid.gridToCanvasY(gridPos)
                this.canvasLength = grid.canvasWidth
                this.sliderLength = grid.gridWidth
                this.maxValue = grid.gridXMax
                this.minValue = grid.gridXMin
            }
        }else{
            throw new Error("Must provide either (canvasX, canvasY) or (grid, gridPos)")
        }

        this.unitLength = this.canvasLength / this.sliderLength
        if (this.vertical){
            this.axis = this.maxValue
        }else{
            this.axis = -this.minValue
        }

        // Dynamic vars
        this.active = true
        this.hidden = false
        this.grabbed = false
        this.grabPos = 0
        this.value = startValue
        this.mouseValue = this.value
        this.prevTime = 0

        this.baseCircleColor = this.circleColor

        this.updateCircle()
    }

    valueToCanvas(val){
        if (this.vertical){
            return this.canvasY + (this.maxValue - val) * this.unitLength
        }else{
            return this.canvasX + (val - this.minValue) * this.unitLength
        }
    }

    canvasToValue(cVal){
        if (this.vertical){
            return - (cVal-this.canvasY) / this.unitLength + this.maxValue
        }else {
            return (cVal - this.canvasY) / this.unitLength + this.minValue
        }
    }

    /**
     * Given a canvas value returns a valid slider value.
     * 
     * @param {number} cVal - the canvas value (y for vertical, x for horizontal)
     * @returns - the slider value
     */
    canvasToValueBounded(cVal){
        var value = this.canvasToValue(cVal)
        value = Math.min(this.maxValue, Math.max(this.minValue, value)) 
        value = Math.round(value/this.increment)*this.increment
        return value
    }

    updateCircle(){
        this.circlePos = this.valueToCanvas(this.value) 
    }

    /**
     * Guarded function to set the value of the slider.
     * @param {number} val 
     */
    #updateValue(val){
        if (val < this.minValue) val = this.minValue
        if (val > this.maxValue) val = this.maxValue
        val = Math.round(val/this.increment)*this.increment
        this.value = val
        this.updateCircle()
    }

    /**
     * Public method for setting the value..
     * @param {*} val 
     */
    setValue(val){
        this.#updateValue(val)
        this.mouseValue = val
    }


    mouseInput(audioManager, mouse){
        
        if (!mouse.held){
            this.grabbed = false
        }
        
        if (this.mouseOverCircle(mouse.x,mouse.y)){
            if (mouse.down){
                this.grabbed = true
                //this.grabPos = this.vertical ? mouse.y - this.circlePos :  mouse.x - this.circlePos
            }
            if (!mouse.held){
                this.circleColor = Color.adjustLightness(this.baseCircleColor, 50)
                mouse.cursor = 'grab'
            }
        }else{
            this.circleColor = this.baseCircleColor
        }

        if (this.grabbed){
            this.mouseValue = this.canvasToValueBounded(this.vertical ? mouse.y : mouse.x)
            this.circleColor = Color.adjustLightness(this.baseCircleColor, -50)
            mouse.cursor =  'grabbing'
        }

        if (this.mouseValue != this.value){
            const dir = this.mouseValue > this.value ? 1 : -1
            this.#updateValue(this.value + dir*this.increment)
            if (this.value == this.minValue || this.value == this.maxValue){
                console.log('A')
                audioManager.playWithPitch('click4', ((this.value-this.minValue) / this.sliderLength)*3-3)
            }else{
                audioManager.playWithPitch('click_001', ((this.value-this.minValue) / this.sliderLength-0.5)*6)
            }
        }
    }

    update(ctx, audioManager, mouse){
        if (this.hidden){
            return
        }

        if (this.active){
            this.mouseInput(audioManager, mouse)
        }

        // Draw line and tick marks
        if (this.showLines){
            Color.setColor(ctx, Color.white)
            if (this.vertical){
                Shapes.RoundedLine(ctx, this.canvasX, this.canvasY, this.canvasX, this.canvasY + this.canvasLength, this.lineWidth)
            }else{
                Shapes.RoundedLine(ctx, this.canvasX, this.canvasY, this.canvasX + this.canvasLength, this.canvasY, this.lineWidth)
            }

            for (let i = 0; i <= this.sliderLength; i++){
                const tickLength = 15
                const lineWidth = this.lineWidth
                var val = this.vertical ? this.maxValue - i : this.minValue + i

                // If we are on a tick, color it
                if (val == this.value && !this.grabbed && this.active){
                    Color.setColor(ctx, this.circleColor)
                }else{
                    Color.setColor(ctx, Color.white)
                }
                // Draw 0 tick with arrows
                var lineType = "rounded"
                if (this.showAxis && i == this.axis){
                    lineType = "arrow"
                }
                // Tick marks
                if (this.vertical){
                    Shapes.Line(ctx,
                        this.canvasX-tickLength, this.canvasY+i*this.unitLength,
                        this.canvasX+tickLength, this.canvasY+i*this.unitLength, 
                        lineWidth, lineType
                    )
                }else{
                    Shapes.Line(ctx, 
                        this.canvasX+i*this.unitLength, this.canvasY-tickLength,
                        this.canvasX+i*this.unitLength, this.canvasY+tickLength, 
                        lineWidth, lineType
                    )
                }
            }
        }

        // Draw slider handle (circle)
        Color.setColor(ctx, this.active ? this.circleColor : Color.gray)
        if (this.vertical){
            Shapes.Circle(ctx, this.canvasX, this.circlePos, this.circleRadius)
        }else{
            Shapes.Circle(ctx, this.circlePos, this.canvasY, this.circleRadius)
        }
        
    }


    mouseOverCircle(x,y){
        const square = x => x * x;
        if (this.vertical){
            return square(this.canvasX - x) + square(this.circlePos- y) <= square(this.circleRadius)
        } else {
            return square(this.canvasY - y) + square(this.circlePos - x) <= square(this.circleRadius)
        }
    }


    solved(){
        this.circleColor = Color.green
    }

}