import {Color, Shapes} from '../util/index.js'
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
export class Grid{

    /**
     * Grid constructor
     * 
     * Note on variable names:
     * grid- is used as a prefix to refer to the coordinate system of the grid itself. 
     * canvas- is used as a prefix to refer to the coordinate system of the canvas.
     * 
     * TODO: a better name would be canvasOriginX, etc.
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
        autoCellSize = false,
        lineWidthMax = 4,
        majorLinesX = 1, majorLinesY = 1,
        lineWidthMin = 1,
        xAxisLabel= "", yAxisLabel = "",
    }){
        Object.assign(this, {
            canvasX, canvasY,
            canvasWidth, canvasHeight,
            gridXMin, gridYMin,
            gridXMax, gridYMax,
            labels, arrows,
            lineWidthMax, lineWidthMin,
            majorLinesX, majorLinesY,
            xAxisLabel, yAxisLabel,
        });
        // The location of the x-axis (horizontal axis), starting from 0 at the top of the grid
        this.xAxis = gridYMax
        // The location of the y-axis, starting from 0 at the leftmost tick
        this.yAxis = -gridXMin
        this.originX = canvasX
        this.originY = canvasY // can't decide what to name var ...

        // Line width max = the width of the axes
        // Line width min = the width of the minor lines
        // Width of major lines = 2 * line width min
        

        this.setXBounds(gridXMin, gridXMax)
        this.setYBounds(gridYMin, gridYMax)
        this.lineColor = Color.white
        this.bgColor = Color.darkBlack

        this.cellSizeX = 1 // the size of one grid cell
        this.cellSizeY = 1
        const minCellSize = 20 // pixels
        if (autoCellSize){
            /**
             * Map the scale in pixels to the best cell size.
             * Cell grid size is chosen from: ... 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, ...
             * Cell pixel size is at least minCellSize
             */
            function scaleToCellSize(x){
                const helper = x => minCellSize / (Math.pow(10, Math.floor(Math.log10(x))))
                const cell10 = 10/minCellSize*helper(10/minCellSize*x)
                const cell20 = 20/minCellSize*helper(20/minCellSize*x)
                const cell50 = 50/minCellSize*helper(50/minCellSize*x)
                const cellSize = Math.min(cell10, cell20, cell50)
                const majorLines = cellSize == cell50 ? 4 : 5
                console.log('c50', cell50, cellSize, majorLines)
                return {cellSize: cellSize, majorLines:majorLines}
            }
            const xObj = scaleToCellSize(this.xScale)
            this.cellSizeX = xObj.cellSize
            this.majorLinesX = xObj.majorLines
            console.log('y')
            const yObj = scaleToCellSize(this.yScale)
            this.cellSizeY = yObj.cellSize
            this.majorLinesY = yObj.majorLines
            console.log('y', this.yScale, this.cellSizeY, this.majorLinesY)
        }
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
        this.xAxis = this.gridYMax
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
        if (y < this.canvasY - 1){
            y = this.canvasY
            out = true
        }
        if (y > this.canvasY + this.canvasHeight + 1){
            y = this.canvasY + this.canvasHeight
            out = true
        }
        return {y: y, out:out}
    }

    canvasToGridYBounded(cy){
        var y = this.canvasToGridY(cy)
        if (y > this.gridYMax)
            y = this.gridYMax
        if (y < this.gridYMin)
            y = this.gridYMin
        return y
    }


    isInBoundsCanvasY(cy){
        return cy >= this.canvasY && cy <= this.canvasY + this.canvasHeight
    }

    isInBoundsCanvasX(cx){
        return cx >= this.canvasX && cx <= this.canvasX + this.canvasWidth + 1
    }

    isInBoundsGridY(gy){
        return this.gridYMin <= gy && gy <= this.gridYMax
    }

    canvasToGridX(cx){
        return (cx - this.canvasX) / this.xScale + this.gridXMin
    }

    canvasToGridY(cy){
        return (cy - this.canvasY) / - this.yScale + this.gridYMax
    }

    /**
     * Prefer the pattern with separate x and y
     */
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
        ctx.shadowColor = 'rgba(255, 255, 255, 0.05)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = -5;
        ctx.shadowOffsetY = -5;
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight)
        ctx.shadowColor = 'transparent';
        Color.setColor(ctx,this.lineColor)

        // Horizontal lines. Starting at top = 0
        ctx.font = '20px monospace'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        var i = 0 // line count
        var gy = this.gridYMin 
        while (gy < this.gridYMax){
            gy = Number((this.gridYMin + i*this.cellSizeY).toFixed(6))
            const cy = this.canvasHeight - this.yScale*i*this.cellSizeY// canvas x (relative)
            var lineWidth = this.lineWidthMax  
            var endCap = 'none'
            const ratio = gy / (this.majorLinesY*this.cellSizeY)
            if (gy == 0){
                if (this.arrows) endCap = 'arrow'
                if (this.labels) ctx.fillText(gy,  - 20, cy)
            } else if (Math.abs(ratio - Math.round(ratio)) < 1e-9){
                lineWidth = this.lineWidthMax/2 // 0.5*(this.lineWidthMin + this.lineWidthMax)  
                if (this.labels) ctx.fillText(gy,  - 20, cy)
            }else {
                lineWidth = this.lineWidthMax / 4
            }
            Shapes.Line(
                ctx,
                0, cy, 
                this.canvasWidth, cy, 
                lineWidth, 
                endCap
            )
            i++
        }

        // Vertical lines. Starting at left = 0
        ctx.font = '20px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        var i = 0 // line count
        var gx = this.gridXMin 
        while (gx < this.gridXMax){
            gx = Number((this.gridXMin + i*this.cellSizeX).toFixed(6))
            const cx = this.xScale*i*this.cellSizeX// canvas x (relative)
            var lineWidth = this.lineWidthMax  
            var endCap = 'none'
            const ratio = gx / (this.majorLinesX*this.cellSizeX)
            if (gx == 0){
                if (this.arrows) endCap = 'arrow'
                if (this.labels) ctx.fillText(gx, cx, this.canvasHeight + 20)
            } else if (Math.abs(ratio - Math.round(ratio)) < 1e-9){
            lineWidth = this.lineWidthMax/2 // 0.5*(this.lineWidthMin + this.lineWidthMax)  
            if (this.labels) ctx.fillText(gx, cx, this.canvasHeight + 20)
            }else {
                lineWidth = this.lineWidthMax / 4
            }
            Shapes.Line(
                ctx,
                cx, 0, 
                cx, this.canvasHeight, 
                lineWidth, 
                endCap
            )
            i++
        }

        ctx.fillText(this.xAxisLabel, this.canvasWidth/2, this.canvasHeight+50)
        ctx.rotate(-Math.PI/2)
        ctx.fillText(this.yAxisLabel, -this.canvasHeight/2, -80)

        ctx.resetTransform()
    }

}
