class Grid{

    constructor(origin_x, origin_y, width, height, gridSize, lineWidthMax){
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.width = width
        this.height = height
        this.gridSize = gridSize
        this.lineWidthMax = lineWidthMax
        this.lines = []
    }

    draw(ctx){
        Color.setColor(ctx,Color.white)
        for (let i = 0; i <= this.gridSize; i++){
            const lineWidth = this.lineWidthMax// * (i % (this.gridSize/2) == 0 ? 1 : 1/2)
            // Horizontal
            Shapes.RoundedLine(ctx, this.origin_x,            this.origin_y+this.height/this.gridSize*i, 
                                  this.origin_x+this.width, this.origin_y+this.height/this.gridSize*i, lineWidth)
            // Vertical
            Shapes.RoundedLine(ctx, this.origin_x+this.width/this.gridSize*i, this.origin_y, 
                                  this.origin_x+this.width/this.gridSize*i, this.origin_y+this.height, lineWidth)
        }
        Color.setColor(ctx,Color.red)
        for (let i = 0; i < this.lines.length; i++){
            const line = this.lines[i]
            Shapes.LineSegment(ctx, this.origin_x+(line.start_x+this.gridSize/2)*this.width/this.gridSize, 
                                    this.origin_y+(-line.start_y+this.gridSize/2)*this.height/this.gridSize,
                                    this.origin_x+(line.end_x+this.gridSize/2)*this.width/this.gridSize,
                                    this.origin_y+(-line.end_y+this.gridSize/2)*this.height/this.gridSize,
                                    this.lineWidthMax, this.lineWidthMax*1.5)
        }
    }
    // {start_x:start_x,start_y:start_y,end_x:end_x,end_y:end_y}
    addLine(line){
        this.lines.push(line)
    }

    

    mouseMove(x,y){
        return -1
    }

    grab(x,y){
    }

    release(x,y){
    }

}
