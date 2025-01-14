class Slider{


    lineWidth = 5
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
    constructor(x, y, length, numDivision, startValue,  axis, increment = 0.1, visible = true, vertical = true, circleRadius=15){
        this.x = x
        this.y = y
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
            this.circle_pos = this.y + (this.axis - this.value)* this.unitLength
        }else{
            this.circle_pos = this.x + this.length - (this.axis - this.value)* this.unitLength
        }
        this.circleColor = Color.red

        this.vertical = vertical
        this.end_x = x + length
        this.end_y = y
        if (vertical){
            this.end_x = x
            this.end_y = y + length
        }
    }

    setValue(val){
        this.value = val
        this.circle_pos = this.y + (this.axis - this.value)* this.unitLength
    }

    draw(ctx){

        if(this.lineWidthMax != -1){

            Color.setColor(ctx, Color.white)
            if (this.visible){
                Shapes.RoundedLine(ctx, this.x, this.y, this.end_x, this.end_y, this.lineWidthMax)
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
                        Shapes.Line(ctx, this.x-crossLength, this.y+i*this.unitLength,
                        this.x+crossLength, this.y+i*this.unitLength, 
                        lineWidth, lineType)
                    }else{
                        Shapes.Line(ctx, this.x+i*this.unitLength, this.y -crossLength,
                            this.x+i*this.unitLength, this.y+crossLength, 
                            lineWidth, lineType)
                    }
                }
            }
        }

        Color.setColor(ctx, Color.red)
        if (this.vertical){
            Shapes.Circle(ctx, this.x,this.circle_pos, this.circleRadius)
        }else{
            Shapes.Circle(ctx, this.circle_pos,this.y, this.circleRadius)
        }

    }

    mouseMove(x,y){
        if (this.grabbed){
            
            this.circle_pos = Math.max(Math.min(y - this.grab_pos, this.y+this.length), this.y)
            var value =  this.axis - Math.round((this.circle_pos-this.y)/this.unitLength/this.increment)*this.increment
            if (!this.vertical){
                this.circle_pos = Math.max(Math.min(x - this.grab_pos, this.x+this.length), this.x)
                value = - this.axis + Math.round((this.circle_pos-this.x)/this.unitLength/this.increment)*this.increment
            }
            if (value != this.value){
                // new Audio('audio/click_003.mp3').play()
                this.value = value
                console.log('value', value)
            }
            if (this.vertical){
                this.circle_pos = this.y + (this.axis - this.value)* this.unitLength
            }else{
                this.circle_pos = this.x + this.length - (this.axis - this.value)* this.unitLength
            }
            return 'grabbing'
        }
        if ((this.vertical && (this.x - x)*(this.x - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
        || (!this.vertical && (this.y - y)*(this.y - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            return 'grab'
        }
        return null
    }

    mouseDown(x,y){
        if ((this.vertical && (this.x - x)*(this.x - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
            || (!this.vertical && (this.y - y)*(this.y - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
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
        this.grabbed = false
        if ((this.vertical && (this.x - x)*(this.x - x) + (this.circle_pos - y)*(this.circle_pos- y) <= this.circleRadius*this.circleRadius)
            || (!this.vertical && (this.y - y)*(this.y - y) + (this.circle_pos - x)*(this.circle_pos- x) <= this.circleRadius*this.circleRadius)){
            return 'grab'
        }
        return null
        //new Audio('audio/click_001.ogg').play();
        // this.value = Math.round((this.circle_pos-this.y)/this.length*this.numDivision)
        // this.circle_y = this.y + this.value* this.length/this.numDivision
    }

    solved(){
        this.circleColor = Color.green
    }

}