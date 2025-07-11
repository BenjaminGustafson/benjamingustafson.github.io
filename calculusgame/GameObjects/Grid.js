/**
 * Class Grid
 * 
 * Lines on the grid are supplied with the addLine method.
 * There is no mouse interaction with the object.
 */
class Grid{

    /**
     * 
     * 
     * @param {*} originX 
     * @param {*} originY 
     * @param {*} width width in pixels
     * @param {*} height 
     * @param {*} gridWidth width in grid squares
     * @param {*} gridHeight height in grid squares
     * @param {*} lineWidthMax 
     * @param {*} x_axis The location of the x-axis, counting from the top starting at 0.
     * @param {*} y_axis The location of the y-axis, counting from the left starting at 0.
     */
    constructor(originX, originY, width, height, gridWidth, gridHeight, lineWidthMax, x_axis = -1, y_axis = -1, labels = false){
        this.originX = originX
        this.originY = originY
        this.width = width
        this.height = height
        this.gridWidth = gridWidth
        this.gridHeight = gridHeight
        this.lineWidthMax = lineWidthMax
        this.lines = []
        this.x_axis = x_axis
        this.y_axis = y_axis
        this.unit_scale = gridWidth/width
        this.grid_x_min = -y_axis // grid value of left
        this.grid_y_min = x_axis - gridHeight // grid value of the bottom
        this.grid_x_max = gridWidth-y_axis
        this.grid_y_max = x_axis
        this.labels = labels
    }

    draw(ctx){
        Color.setColor(ctx,Color.white)
        // Horizontal lines. Starting at top = 0
        ctx.font = '20px monospace'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        for (let i = 0; i <= this.gridHeight; i++){
            const lineWidth = this.lineWidthMax// * (i % (this.gridSize/2) == 0 ? 1 : 1/2)
            const y = this.originY+this.height/this.gridHeight*i
            Shapes.Line(ctx,
                        this.originX,            y, 
                        this.originX+this.width, y, 
                        (i == this.x_axis ? lineWidth : lineWidth), (i == this.x_axis ? "arrow" : "rounded"))
            if (this.labels){
                ctx.fillText(this.x_axis-i, this.originX - 20, y)
            }
            
        }
        // Vertical lines
        ctx.font = '20px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        for (let i = 0; i <= this.gridWidth; i++){
            const lineWidth = this.lineWidthMax
            const x = this.originX+this.width/this.gridWidth*i
            Shapes.Line(ctx,
                        x, this.originY, 
                        x, this.originY+this.height, 
                        lineWidth, (i == this.y_axis ? "c" : "rounded"))
            if (this.labels){
                ctx.fillText(i, x, this.originY + this.height+20)
            }

        }
        Color.setColor(ctx,Color.red)
        for (let i = 0; i < this.lines.length; i++){
            const line = this.lines[i]
            Shapes.LineSegment(ctx, this.originX+(line.start_x)*this.width/this.gridWidth, 
                                    this.originY+this.height+(-line.start_y)*this.height/this.gridHeight,
                                    this.originX+(line.end_x)*this.width/this.gridWidth,
                                    this.originY+this.height+(-line.end_y)*this.height/this.gridHeight,
                                    this.lineWidthMax, this.lineWidthMax*1.5)
        }


    }


    gridToCanvas(gx,gy){
        // -- y_axis = 3       
        // --
        // -- gy = -2
        // -- 
        
        const cx = this.originX + this.width/this.gridWidth * (gx + this.y_axis)
        const cy = this.originY - this.height/this.gridHeight * (gy - this.x_axis)
        return {x: cx, y: cy,oob:true}
    }

    canvasToGrid(cx, cy){
        const gx = (cx - this.originX) * (this.gridWidth/this.width) - this.y_axis
        const gy = (cy - this.originY) * (-this.gridHeight/this.height) + this.x_axis
        return {x: gx, y:gy}
    }


    /**
     * A line is encoded as an object of the form {start_x:start_x,start_y:start_y,end_x:end_x,end_y:end_y}
     * 
     *  TODO: delete this as it is never used?
     *  
    */ 
    addLine(line){
        this.lines.push(line)
    }

}
