/**
 * A slider UI element.
 * 
 * Drawn as a line with tick marks and a circle that can be dragged along the line.
 * 
 */
class Slider{

    /**
     * 
     * TODO: refactor to not use positional optional args
     * And specify with maxVal rather than axis.
     * 
     * Sliders values example: 
     *
     * _____ i=0 value = 2   y = y 
     *   |
     * __|__ i=1 value = 1   y = y + unitLength
     *   |
     * <_|_> i=2 value = 0  axis = 2
     *   |
     * __|__ i=3 value = -1
     *
     * value = axis - i
     * y = top_y + unitLength * i 
     *   = top_y + unitLength * (axis - value)
     * 
     * value = axis - (y - top_y)/unitLength
     * 
     * @param {*} originX x-value of middle of slider (vertical)
     * @param {*} originY y-value of top of slider (vertical)
     * @param {*} length 
     * @param {*} numDivision The slider will have numDivision+1 tick marks.
     * @param {*} startValue 
     * @param {*} axis Where 0 is on the slider. Counting from the top down starting at zero.
     * @param {*} increment 
     * @param {*} visible 
     * @param {*} vertical 
     * @param {*} circleRadius 
     */
    constructor(originX, originY, length, numDivision, startValue,  axis, increment = 0.1, visible = true, vertical = true, circleRadius=15){
        this.lineWidth = 5
        this.active = true
        this.circleColorActive = Color.red
        this.circleColor = Color.red
        this.originX = originX
        this.originY = originY
        this.length = length
        this.numDivision = numDivision
        this.grabbed = false
        this.grab_pos = 0
        this.visible = visible
        this.increment = increment
        this.circleRadius = circleRadius
        this.vertical = vertical

        if (axis == -1 || axis == null){
            this.axis = this.numDivision
            this.showAxis = false
        }else{
            this.axis = axis
            this.showAxis = true
        }
        this.value = startValue // The true value of the slider
        this.unitLength = this.length/this.numDivision
        // The circle goes at the tick mark given by the value
        if (this.vertical){
            this.circle_pos = this.originY + (this.axis - this.value) * this.unitLength
        }else{
            this.circle_pos = this.originX - (this.axis - this.value)* this.unitLength
        }

        
        
        if (this.vertical){
            this.end_x = originX
            this.end_y = originY + length
            this.maxVal = axis
            this.minVal = axis-numDivision
        }else{
            this.end_x = originX + length
            this.end_y = originY
            this.maxVal = numDivision-axis // Definitely bugged, but works if axis = 0
            this.minVal = axis
        }
        
    }

    setValue(val){
        console.log('value',this.minVal,this.maxVal,val)
        if (val < this.minVal) val = this.minVal
        if (val > this.maxVal) val = this.maxVal
        this.value = val
        if (this.vertical){
            this.circle_pos = this.originY + (this.axis - this.value)* this.unitLength// TODO duplicate code
        }else{
            this.circle_pos = this.originX  - (this.axis - this.value)* this.unitLength
        }
    }

    draw(ctx, audioManager){
        if (this.hidden){
            return
        }
        if (this.active){
            this.circleColor = this.circleColorActive
        }else{
            this.circleColor = Color.gray
        }

        if (this.playSound){
            console.log('Playing')
            audioManager.play('click')
            this.playSound = false
        }

        if(this.lineWidth != -1){

            Color.setColor(ctx, Color.white)
            if (this.visible){
                Shapes.RoundedLine(ctx, this.originX, this.originY, this.end_x, this.end_y, this.lineWidth)

                for (let i = 0; i <= this.numDivision; i++){
                    const crossLength = 15
                    const lineWidth = this.lineWidth
                    var value = this.axis - i
                    if (!this.vertical){
                        value = -this.axis + i
                    }
                    // If we are on a tick, color it
                    if (value == this.value && !this.grabbed){
                        Color.setColor(ctx, this.circleColor)
                    }else{
                        Color.setColor(ctx, Color.white)
                    }
                    // Draw 0 tick with arrows
                    var lineType = "rounded"
                    if (this.showAxis == true && i == this.axis){
                        lineType = "arrow"
                    }
                    // Tick marks
                    if (this.vertical){
                        Shapes.Line(ctx, this.originX-crossLength, this.originY+i*this.unitLength,
                        this.originX+crossLength, this.originY+i*this.unitLength, 
                        lineWidth, lineType)
                    }else{
                        Shapes.Line(ctx, this.originX+i*this.unitLength, this.originY -crossLength,
                            this.originX+i*this.unitLength, this.originY+crossLength, 
                            lineWidth, lineType)
                    }
                }
            }
        }

        // Draw slider handle (circle)
        Color.setColor(ctx, this.circleColor)
        if (this.vertical){
            Shapes.Circle(ctx, this.originX,this.circle_pos, this.circleRadius)
        }else{
            Shapes.Circle(ctx, this.circle_pos,this.originY, this.circleRadius)
        }
        ctx.resetTransform()
    }

    mouseMove(x,y){
        if (!this.active){
            return null
        }
        if (this.grabbed){
            
            this.circle_pos = Math.max(Math.min(y - this.grab_pos, this.originY+this.length), this.originY)
            var value =  this.axis - Math.round((this.circle_pos-this.originY)/this.unitLength/this.increment)*this.increment
            if (!this.vertical){
                this.circle_pos = Math.max(Math.min(x - this.grab_pos, this.originX+this.length), this.originX)
                value = - this.axis + Math.round((this.circle_pos-this.originX)/this.unitLength/this.increment)*this.increment
            }
            if (value != this.value){
                this.playSound = true
                this.value = value
            }
            if (this.vertical){
                this.circle_pos = this.originY + (this.axis - this.value)* this.unitLength
            }else{
                this.circle_pos = this.originX - (this.axis - this.value)* this.unitLength
            }
            return 'grabbing'
        }
        if ((this.vertical && (this.originX - x)*(this.originX - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
        || (!this.vertical && (this.originY - y)*(this.originY - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            return 'grab'
        }
        return null
    }

    mouseDown(x,y){
        //new Audio('audio/click_001.ogg').play();
        if (!this.active){
            return null
        }
        if ((this.vertical && (this.originX - x)*(this.originX - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
            || (!this.vertical && (this.originY - y)*(this.originY - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            this.grabbed = true
            if (this.vertical){
                this.grab_pos = y - this.circle_pos
            }else{
                this.grab_pos = x - this.circle_pos
            }
            return 'grabbing'
        }
        
        return null
          
    }

    mouseUp(x,y){
        if (!this.active){
            return null
        }
        this.grabbed = false
        if ((this.vertical && (this.originX - x)*(this.originX - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
            || (!this.vertical && (this.originY - y)*(this.originY - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            return 'grab'
        }
        return null
        //new Audio('audio/click_001.ogg').play();
        // this.value = Math.round((this.circle_pos-this.originY)/this.length*this.numDivision)
        // this.circle_y = this.originY + this.value* this.length/this.numDivision
    }

    solved(){
        this.circleColor = Color.green
    }

}