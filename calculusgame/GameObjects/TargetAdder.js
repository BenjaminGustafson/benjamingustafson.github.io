
class TargetAdder{


    constructor(grid){
        this.grid = grid
        this.targets = []
        this.active = true
        this.overGrid = false
        this.targetX = 0
        this.targetY = 0
        this.targetGY = 0
        this.targetGX = 0
        this.targetSize = 15
        this.precision = 1
    }   


    draw(ctx){
        for (let i = 0; i < this.targets.length; i++){
            this.targets[i].draw(ctx)
        }
        if (this.overGrid){
            Color.setColor(ctx,Color.magenta)
            Shapes.Rectangle(ctx,this.targetX-this.targetSize/2,this.targetY-this.targetSize/2,this.targetSize,this.targetSize,this.size*0.5,true)
        }
    }

    

    mouseMove(x,y){
        const g = this.grid
        if (!this.active) return null
        const p = this.targetSize
        if (x >= g.originX - p && x <= g.originX + g.width +p && y >= g.originY-p && y <= g.originY + g.height + p){
            this.overGrid = true
            const gridCoord = g.canvasToGrid(x,y)
            this.targetGX = Math.round(gridCoord.x/this.precision)*this.precision
            this.targetGY = Math.round(gridCoord.y/this.precision)*this.precision
            const canvasCoord = g.gridToCanvas(this.targetGX,this.targetGY)
            this.targetX = canvasCoord.x
            this.targetY = canvasCoord.y
            return "pointer"
        }else{
            this.overGrid = false
            return null
        }
    }
    mouseDown(x,y){

    }
    mouseUp(x,y){
        if (!this.active || !this.overGrid) return null
        const newTargets = this.targets.filter(t => !(t.x == this.targetX && t.y == this.targetY))
        console.log(this.targets.length, newTargets.length, this.targetX)
        if (newTargets.length == this.targets.length){
            const target = new Target(this.targetX, this.targetY,this.targetSize)
            this.targets.push(target)
        }else{
            this.targets = newTargets
        }
    }
}