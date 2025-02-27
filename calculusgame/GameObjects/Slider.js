class Slider{


    
    /**
     * 
     * Ex: 
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
     * @param {*} x 
     * @param {*} top_y 
     * @param {*} height 
     * @param {*} numDivision The slider will have numDivision+1 tick marks.
     * @param {*} axis Where 0 is on the slider. Counting from the top down starting at zero.
     * @param {*} circleRadius 
     */
    constructor(origin_x, origin_y, length, numDivision, startValue,  axis, increment = 0.1, visible = true, vertical = true, circleRadius=15){
        this.lineWidth = 5
        this.active = true
        this.circleColorActive = Color.red
        this.circleColor = Color.red
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.length = length
        this.numDivision = numDivision
        this.grabbed = false
        this.grab_pos = 0
        this.visible = visible
        this.increment = increment
        this.circleRadius = circleRadius
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
        if (vertical){
            this.circle_pos = this.origin_y + (this.axis - this.value) * this.unitLength
        }else{
            this.circle_pos = this.origin_x + this.length - (this.axis - this.value)* this.unitLength
        }

        this.vertical = vertical
        this.end_x = origin_x + length
        this.end_y = origin_y
        if (vertical){
            this.end_x = origin_x
            this.end_y = origin_y + length
        }
    }

    setValue(val){
        this.value = val
        this.circle_pos = this.origin_y + (this.axis - this.value)* this.unitLength
    }

    draw(ctx){
        if (this.active){
            this.circleColor = this.circleColorActive
        }else{
            this.circleColor = Color.gray
        }
        if(this.lineWidth != -1){

            Color.setColor(ctx, Color.white)
            if (this.visible){
                Shapes.RoundedLine(ctx, this.origin_x, this.origin_y, this.end_x, this.end_y, this.lineWidth)
                for (let i = 0; i <= this.numDivision; i++){
                    const crossLength = 15
                    const lineWidth = this.lineWidth
                    var value = this.axis - i
                    if (!this.vertical){
                        value = -this.axis + i
                    }
                    if (value == this.value && !this.grabbed){
                        Color.setColor(ctx, this.circleColor)
                    }else{
                        Color.setColor(ctx, Color.white)
                    }
                    var lineType = "rounded"
                    if (this.showAxis == true && i == this.axis){
                        lineType = "arrow"
                    }
                    if (this.vertical){
                        Shapes.Line(ctx, this.origin_x-crossLength, this.origin_y+i*this.unitLength,
                        this.origin_x+crossLength, this.origin_y+i*this.unitLength, 
                        lineWidth, lineType)
                    }else{
                        Shapes.Line(ctx, this.origin_x+i*this.unitLength, this.origin_y -crossLength,
                            this.origin_x+i*this.unitLength, this.origin_y+crossLength, 
                            lineWidth, lineType)
                    }
                }
            }
        }

        Color.setColor(ctx, this.circleColor)
        if (this.vertical){
            Shapes.Circle(ctx, this.origin_x,this.circle_pos, this.circleRadius)
        }else{
            Shapes.Circle(ctx, this.circle_pos,this.origin_y, this.circleRadius)
        }

    }

    mouseMove(x,y){
        if (!this.active){
            return null
        }
        if (this.grabbed){
            
            this.circle_pos = Math.max(Math.min(y - this.grab_pos, this.origin_y+this.length), this.origin_y)
            var value =  this.axis - Math.round((this.circle_pos-this.origin_y)/this.unitLength/this.increment)*this.increment
            if (!this.vertical){
                this.circle_pos = Math.max(Math.min(x - this.grab_pos, this.origin_x+this.length), this.origin_x)
                value = - this.axis + Math.round((this.circle_pos-this.origin_x)/this.unitLength/this.increment)*this.increment
            }
            if (value != this.value){
                // new Audio('audio/click_003.mp3').play()
                this.value = value
                console.log('value', value)
            }
            if (this.vertical){
                this.circle_pos = this.origin_y + (this.axis - this.value)* this.unitLength
            }else{
                this.circle_pos = this.origin_x + this.length - (this.axis - this.value)* this.unitLength
            }
            return 'grabbing'
        }
        if ((this.vertical && (this.origin_x - x)*(this.origin_x - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
        || (!this.vertical && (this.origin_y - y)*(this.origin_y - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            return 'grab'
        }
        return null
    }

    mouseDown(x,y){
        if (!this.active){
            return null
        }
        if ((this.vertical && (this.origin_x - x)*(this.origin_x - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
            || (!this.vertical && (this.origin_y - y)*(this.origin_y - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            this.grabbed = true
            if (this.vertical){
                this.grab_pos = y - this.circle_pos
            }else{
                this.grab_pos = x - this.circle_pos
            }
            return 'grabbing'
        }
        return null
        //new Audio('audio/click_003.ogg').play();
          
    }

    mouseUp(x,y){
        if (!this.active){
            return null
        }
        this.grabbed = false
        if ((this.vertical && (this.origin_x - x)*(this.origin_x - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
            || (!this.vertical && (this.origin_y - y)*(this.origin_y - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            return 'grab'
        }
        return null
        //new Audio('audio/click_001.ogg').play();
        // this.value = Math.round((this.circle_pos-this.origin_y)/this.length*this.numDivision)
        // this.circle_y = this.origin_y + this.value* this.length/this.numDivision
    }

    solved(){
        this.circleColor = Color.green
    }

}