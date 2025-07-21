/**
 * 
 * A Grid is a GameObject that draws a grid to the canvas.
 * The Grid itself has no interactivity. 
 * Other GameObjects like FunctionTracers draw themselves on the Grid.
 *
 * The grid class has functions gridToCanvas and canvasToGrid to convert between 
 * pixel coordinates on the canvas and the coordinates on the grid itself.
 * 
 * Depends on Shapes.js, Color.js
 */
class Grid{

    /**
     * Grid constructor
     * 
     * Note on variable names:
     * grid- is used as a prefix to refer to the coordinate system of the grid itself. 
     * canvas- is used as a prefix to refer to the coordinate system of the canvas.
     * 
     * @param {Object} config - Configuration object.
     * @param {number} config.canvasX - x-coordinate of the top-left corner on the canvas.
     * @param {number} config.canvasY - y-coordinate of the top-left corner on the canvas.
     * @param {number} config.canvasWidth - Width in pixels.
     * @param {number} config.canvasHeight - Height in pixels.
     * @param {number} config.gridXMin - Min x-value.
     * @param {number} config.gridYMin - Min y-value.
     * @param {number} config.gridXMax - Max x-value.
     * @param {number} config.gridYMax - Max y-value
     * @param {boolean} config.labels - Whether to draw axis labels.
     * @param {boolean} config.arrows - Whether to draw arrows on the axes.
     * @param {number} config.lineWidthMax - Maximum line width for grid rendering.
     */
    constructor({ 
        canvasX, canvasY, canvasWidth=400, canvasHeight=400,
        gridXMin = -2, gridYMin = -2,
        gridXMax = 2, gridYMax = 2,
        labels = false, arrows = true,
        lineWidthMax = 5
    }){
        Object.assign(this, {
            canvasX, canvasY, canvasWidth, canvasHeight,
            gridXMin, gridYMin,
            gridXMax, gridYMax,
            labels, arrows,
            lineWidthMax
        });
        // The location of the x-axis (horizontal axis), starting from 0 at the top of the grid
        this.xAxis = gridYMax
        // Likewise the location of the y-axis, starting from 0 at the leftmost tick
        this.yAxis = -gridXMin
        this.gridWidth = gridXMax - gridXMin
        this.gridHeight = gridYMax - gridYMin
        // The number of pixels per grid unit on the x-axis
        this.xScale = this.canvasWidth / this.gridWidth
        //
        this.yScale = this.canvasHeight / this.gridHeight
    }

    gridToCanvas(gx,gy){
        const cx = this.canvasX + this.xScale * (gx - this.gridXMin)
        const cy = this.canvasY - this.yScale * (gy - this.gridYMax)
        return {x: cx, y: cy}
    }

    canvasToGrid(cx, cy){
        const gx = (cx - this.canvasX) / this.xScale + this.gridXMin
        const gy = (cy - this.canvasY) / - this.yScale + this.gridYMax
        return {x: gx, y:gy}
    }

    /**
     * Draws the grid on the canvas.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){
        Color.setColor(ctx,Color.white)

        // Horizontal lines. Starting at top = 0
        ctx.font = '20px monospace'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        for (let i = 0; i <= this.gridHeight; i++){
            const lineWidth = this.lineWidthMax // Here is where you could implement varied grid line canvasWidth
            const cy = this.canvasY+this.yScale*i
            Shapes.Line(ctx,
                        this.canvasX, cy,
                        this.canvasX+this.canvasWidth, cy, 
                        lineWidth, 
                        (i == this.xAxis && this.arrows ? "arrow" : "rounded"))
            if (this.labels){
                ctx.fillText(this.gridYMax-i, this.canvasX - 20, cy)
            }
            
        }

        // Vertical lines. Starting at left = 0
        ctx.font = '20px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        for (let i = 0; i <= this.gridWidth; i++){
            const lineWidth = this.lineWidthMax
            const cx = this.canvasX+this.xScale*i
            Shapes.Line(ctx,
                        cx, this.canvasY, 
                        cx, this.canvasY+this.canvasHeight, 
                        lineWidth, 
                        (i == this.yAxis && this.arrows ? "arrow" : "rounded"))
            if (this.labels){
                ctx.fillText(this.gridXMin + i, cx, this.canvasY + this.canvasHeight+20)
            }
        }
    }

}
