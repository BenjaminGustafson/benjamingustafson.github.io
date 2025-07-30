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
     * @param {number} config.gridXMin - Min x-value. Integer.
     * @param {number} config.gridYMin - Min y-value.
     * @param {number} config.gridXMax - Max x-value.
     * @param {number} config.gridYMax - Max y-value
     * @param {boolean} config.labels - Whether to draw axis labels.
     * @param {boolean} config.arrows - Whether to draw arrows on the axes.
     * @param {number} config.lineWidthMax - Maximum line width for grid rendering.
     */
    constructor({ 
        canvasX, canvasY,
        canvasWidth=400, canvasHeight=400,
        gridXMin = -2, gridYMin = -2,
        gridXMax = 2, gridYMax = 2,
        labels = false, arrows = true,
        lineWidthMax = 5
    }){
        Object.assign(this, {
            canvasX, canvasY,
            canvasWidth, canvasHeight,
            gridXMin, gridYMin,
            gridXMax, gridYMax,
            labels, arrows,
            lineWidthMax
        });
        // The location of the x-axis (horizontal axis), starting from 0 at the top of the grid
        this.xAxis = gridYMax
        // The location of the y-axis, starting from 0 at the leftmost tick
        this.yAxis = -gridXMin
        this.originX = canvasX
        this.originY = canvasY // can't decide what to name var ...

        this.setXBounds(gridXMin, gridXMax)
        this.setYBounds(gridYMin, gridYMax)
        this.lineColor = Color.white
        this.bgColor = Color.black2
    }

    setXBounds(xMin, xMax){
        this.gridXMin = xMin
        this.gridXMax = xMax
        this.gridWidth = xMax - xMin
        this.xScale = this.canvasWidth / this.gridWidth
    }

    setYBounds(yMin, yMax){
        this.gridYMin = yMin
        this.gridYMax = yMax
        this.gridHeight = yMax - yMin
        this.yScale = this.canvasHeight / this.gridHeight
    }
    
    gridToCanvasX(gx){
        return this.canvasX + this.xScale * (gx - this.gridXMin)
    }

    gridToCanvasY(gy){
        return this.canvasY - this.yScale * (gy - this.gridYMax)
    }

    gridToCanvas(gx,gy){
        return {x: this.gridToCanvasX(gx), y: this.gridToCanvasY(gy)}
    }

    gridToCanvasBoundedX(gx){
        var x = this.gridToCanvasX(gx)
        var out = false
        if (x < this.canvasX) {
            x = this.canvasX
            out = true
        }
        if (x > this.canvasX + this.canvasWidth){
            x = this.canvasX + this.canvasWidth
            out = true
        }
        return {x: x, out:out}
    }

    gridToCanvasBoundedY(gy){
        var y = this.gridToCanvasY(gy)
        var out = false
        if (y < this.canvasY){
            y = this.canvasY
            out = true
        }
        if (y > this.canvasY + this.canvasHeight){
            y = this.canvasY + this.canvasHeight
            out = true
        }
        return {y: y, out:out}
    }

    canvasToGridX(cx){
        return (cx - this.canvasX) / this.xScale + this.gridXMin
    }

    canvasToGridY(cy){
        return (cy - this.canvasY) / - this.yScale + this.gridYMax
    }

    canvasToGrid(cx, cy){
        return {x: this.canvasToGridX(cx), y:this.canvasToGridY(cy)}
    }

    

    /**
     * Draws the grid on the canvas.
     * @param {CanvasRenderingContext2D} ctx 
     */
    update(ctx, audioManager, mouse){
        ctx.translate(this.canvasX,this.canvasY)
        Color.setColor(ctx, this.bgColor)
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight)
        Color.setColor(ctx,this.lineColor)

        // Horizontal lines. Starting at top = 0
        ctx.font = '20px monospace'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        for (let i = 0; i <= this.gridHeight; i++){
            const lineWidth = this.lineWidthMax // Here is where you could implement varied grid line canvasWidth
            const cy = this.yScale*i
            Shapes.Line(ctx,
                        0, cy,
                        this.canvasWidth, cy, 
                        lineWidth, 
                        (i == this.xAxis && this.arrows ? "arrow" : "rounded"))
            if (this.labels){
                ctx.fillText(this.gridYMax-i, - 20, cy)
            }
            
        }

        // Vertical lines. Starting at left = 0
        ctx.font = '20px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        for (let i = 0; i <= this.gridWidth; i++){
            const lineWidth = this.lineWidthMax
            const cx = this.xScale*i
            Shapes.Line(ctx,
                        cx, 0, 
                        cx, this.canvasHeight, 
                        lineWidth, 
                        (i == this.yAxis && this.arrows ? "arrow" : "rounded"))
            if (this.labels){
                ctx.fillText(this.gridXMin + i, cx, this.canvasHeight+20)
            }
        }

        ctx.resetTransform()
    }

}
