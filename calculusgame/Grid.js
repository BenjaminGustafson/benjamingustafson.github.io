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
     * @param {*} origin_x 
     * @param {*} origin_y 
     * @param {*} width width in pixels
     * @param {*} height 
     * @param {*} gridWidth width in grid squares
     * @param {*} gridHeight height in grid squares
     * @param {*} lineWidthMax 
     * @param {*} x_axis The location of the x-axis, counting from the left starting at 0.
     * @param {*} y_axis The location of the y-axis, counting from the top starting at 0.
     */
    constructor(origin_x, origin_y, width, height, gridWidth, gridHeight, lineWidthMax, x_axis = -1, y_axis = -1){
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.width = width
        this.height = height
        this.gridWidth = gridWidth
        this.gridHeight = gridHeight
        this.lineWidthMax = lineWidthMax
        this.lines = []
        this.x_axis = x_axis
        this.y_axis = y_axis
        this.unit_scale = gridWidth/width
        this.grid_x_min = -x_axis 
        this.grid_y_min = y_axis
        this.grid_x_max = this.grid_x_min + this.gridWidth
        this.grid_y_max = this.grid_y_min + this.gridHeight 
    }

    draw(ctx){
        Color.setColor(ctx,Color.white)
        // Horizontal lines. Starting at top = 0
        for (let i = 0; i <= this.gridHeight; i++){
            const lineWidth = this.lineWidthMax// * (i % (this.gridSize/2) == 0 ? 1 : 1/2)
            Shapes.Line(ctx,
                        this.origin_x,            this.origin_y+this.height/this.gridHeight*i, 
                        this.origin_x+this.width, this.origin_y+this.height/this.gridHeight*i, 
                        (i == this.x_axis ? lineWidth : lineWidth), (i == this.x_axis ? "arrow" : "rounded"))
        }
        // Vertical lines
        for (let i = 0; i <= this.gridWidth; i++){
            const lineWidth = this.lineWidthMax
            Shapes.Line(ctx,
                        this.origin_x+this.width/this.gridWidth*i, this.origin_y, 
                        this.origin_x+this.width/this.gridWidth*i, this.origin_y+this.height, 
                        lineWidth, (i == this.y_axis ? "arrow" : "rounded"))

        }
        Color.setColor(ctx,Color.red)
        for (let i = 0; i < this.lines.length; i++){
            const line = this.lines[i]
            Shapes.LineSegment(ctx, this.origin_x+(line.start_x)*this.width/this.gridWidth, 
                                    this.origin_y+this.height+(-line.start_y)*this.height/this.gridHeight,
                                    this.origin_x+(line.end_x)*this.width/this.gridWidth,
                                    this.origin_y+this.height+(-line.end_y)*this.height/this.gridHeight,
                                    this.lineWidthMax, this.lineWidthMax*1.5)
        }


    }

    gridToCanvas(gx,gy){
        // -- y_axis = 3       
        // --
        // -- gy = -2
        // -- 
        
        const cx = this.origin_x + this.width/this.gridWidth * (gx + this.y_axis)
        const cy = this.origin_y - this.height/this.gridHeight * (gy - this.x_axis)
        return {x: cx, y: cy,oob:true}
    }

    canvasToGrid(cx, cy){
        const gx = (cx - this.origin_x) * (this.gridWidth/this.width) - this.y_axis
        const gy = (cy - this.origin_y) * (-this.gridHeight/this.height) + this.x_axis
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
