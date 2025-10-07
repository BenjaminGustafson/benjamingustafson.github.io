import {Color, Shapes} from '../util/index.js'
/**
 * A slider UI element.
 * 
 * Drawn as a line with tick marks and a circle that can be dragged along the line.
 * 
 */
export class Slider{

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
        minValue, maxValue, sliderLength,
        canvasLength = 400,
        startValue = 0,
        increment = 0.1,
        circleRadius=12,
        vertical = true,
        showLines = true, 
        showAxis = false,
        circleColor = new Color(255,20,0),//,
        lineWidth = 4,
        tickLength = 8,
        valueLabel = true,
    }){
        Object.assign(this, {
            canvasLength, sliderLength, minValue, maxValue, startValue, increment, circleRadius,
            vertical, showLines, showAxis, circleColor, lineWidth, gridPos, valueLabel, tickLength
        })

        if (canvasX != null && canvasY != null){
            this.canvasX = canvasX
            this.canvasY = canvasY

            if (sliderLength == null && maxValue != null && minValue != null){
                this.sliderLength = maxValue - minValue
            }else if (sliderLength != null && maxValue != null && minValue == null){
                this.minValue = maxValue - sliderLength
            }else if (sliderLength != null && maxValue == null && minValue != null){
                this.maxValue = minValue + sliderLength
            }else if (sliderLength != null){
                this.minValue = - Math.floor(sliderLength/2)
                this.maxValue = Math.ceil(sliderLength/2)
            } else {
                this.minValue = 0
                this.maxValue = 1
                this.sliderLength = 1
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
        this.clickable = true // turn off mouse input while keeping slider active
        this.hidden = false
        this.grabbed = false
        this.grabPos = 0
        this.mouseOver = false
        //this.value = startValue
        //this.mouseValue = this.value
        this.setValue(startValue)
        this.prevTime = 0

        this.baseCircleColor = this.circleColor

        this.circlePos = this.valueToCanvas(this.value) 
    }

    setSize(maxValue, sliderLength){
        this.maxValue = maxValue
        this.sliderLength = sliderLength
        this.minValue = maxValue - sliderLength
        this.unitLength = this.canvasLength / this.sliderLength
        if (this.vertical){
            this.axis = this.maxValue
        }else{
            this.axis = -this.minValue
        }
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
            return (cVal - this.canvasX) / this.unitLength + this.minValue
        }
    }

    gaurdValue(val){
        val = Math.min(this.maxValue, Math.max(this.minValue, val)) 
        val = Math.round(val/this.increment)*this.increment
        return val
    }

    /**
     * Set the slider's actual value.
     * If the value is not the mouseValue, the slider will move 
     * to the mouse value.
     */
    setValueInternal(val){
        this.value = this.gaurdValue(val)
        this.circlePos = this.valueToCanvas(this.value) 
    }

    /**
     * Set the value by moving the slider to the value.
     * Takes time and plays sound.
     */
    moveToValue(val){
        this.mouseValue = this.gaurdValue(val)
    }

    /**
     * Immediately jump the slider to the value without 
     * playing sound.
     */
    setValue (val){
        this.setValueInternal(val)
        this.mouseValue = this.value
    }


    mouseInput(audioManager, mouse){
        
        if (!mouse.held){
            this.grabbed = false
        }
        
        if (this.mouseOverCircle(mouse.x,mouse.y)){
            this.mouseOver = true
            if (mouse.down){
                this.grabbed = true
                //this.grabPos = this.vertical ? mouse.y - this.circlePos :  mouse.x - this.circlePos
            }
            if (!mouse.held){
                this.circleColor = Color.adjustLightness(this.baseCircleColor, 50)
                mouse.cursor = 'grab'
            }
        }else{
            this.mouseOver = false
            this.circleColor = this.baseCircleColor
        }

        if (this.grabbed){
            this.mouseValue = this.gaurdValue(this.canvasToValue(this.vertical ? mouse.y : mouse.x))
            this.circleColor = Color.adjustLightness(this.baseCircleColor, -50)
            mouse.cursor =  'grabbing'
        }

        
    }

    update(ctx, audioManager, mouse){
        if (this.hidden){
            return
        }

        if (this.active && this.clickable){
            this.mouseInput(audioManager, mouse)
        }

        if (this.mouseValue != this.value){
            const dir = (this.mouseValue > this.value ? 1 : -1)
            this.setValueInternal(this.value + dir*this.increment)
            audioManager.play('click_001', {pitch:((this.value-this.minValue) / this.sliderLength-0.5)*6, volume:0.8})
            // if (this.value%1 == 0){// == this.minValue || this.value == this.maxValue){
            //     console.log('A')
            //     audioManager.play('click4', ((this.value-this.minValue) / this.sliderLength)*3-3)
            // }else {
            //    audioManager.play('click_001', ((this.value-this.minValue) / this.sliderLength-0.5)*6, 0.2)
            //}
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
                const tickLength = this.tickLength
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
        if (!this.clickable) this.circleColor = Color.red
        Color.setColor(ctx, this.active ? this.circleColor : Color.gray)
        const circleX = this.vertical ? this.canvasX : this.circlePos
        const circleY = this.vertical ? this.circlePos : this.canvasY
        Shapes.Circle({
            ctx:ctx,
            centerX: circleX,
            centerY: circleY,
            radius:this.circleRadius,
            inset: this.clickable,
            shadow:this.grabbed, 
        })

        if (this.valueLabel && (this.mouseOver || this.grabbed)){
            ctx.font = `${this.circleRadius} px monospace`
            const text = Number(this.value.toFixed(6))
            const textWidth = ctx.measureText(text).width
            const labelPad = 10
            const labelRight = circleX - this.circleRadius - 20
            Color.setColor(ctx, Color.darkBlack)
            Shapes.Rectangle({
                ctx: ctx, 
                originX: labelRight - labelPad * 2 - textWidth,
                originY: circleY-this.circleRadius,
                width: textWidth + 20,
                height: this.circleRadius*2,
                shadow: 8,
            })
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            Color.setColor(ctx, Color.white)
            ctx.fillText(text,labelRight - labelPad, circleY)
            
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