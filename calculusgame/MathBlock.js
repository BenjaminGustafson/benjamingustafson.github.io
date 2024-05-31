
class MathBlock {
    depth = 0
    x = 0
    y = 0 
    w = 0
    h = 0

    grabbed = false
    color = "rgb(0,0,0)";
    grabColor = "rgb(100,100,100)"
    
    origin_x = 10
    origin_y = 100
    base_width = 50
    base_height = 70
    padding = 5
    

    constructor (num_children, token){
        this.num_children = num_children
        this.children = new Array(num_children)
        this.token = token
    }

    /**
     * Call this function after setting up the connections for the tree.
     * 
     * Calculates: depth, x, y, width, height 
     */
    setupChildren (x = this.origin_x,y=this.origin_y,depth=0){
        this.x = x
        this.y = y
        this.h = this.base_height
        this.w = this.base_width
        this.depth = depth

        for (let i = 0; i < this.num_children; i++){
            const child = this.children[i]
            child.setupChildren(x+this.w+this.padding,y+this.padding,depth+1)
            this.w += child.w + this.padding
            this.h = Math.max(this.h, child.h) + this.padding
        }
    }


    setChild(n, child){
        this.children[n] = child
    }

    getChild(n){
        return this.children[n]
    }

    mouseDown(mx,my,grabber){
        this.children.forEach(c => c.mouseDown(mx,my,grabber))   
    }

    mouseUp(mx,my){
        this.children.forEach(c => c.mouseUp(mx,my))
    }

    mouseMove(mx,my){
        this.children.forEach(c => c.mouseMove(mx,my))
    }

    draw (ctx){
        

        if (this.grabbed){
            ctx.strokeStyle = this.grabColor
        }else{
            ctx.strokeStyle = this.color
        }
        ctx.fillStyle = ctx.strokeStyle
        ctx.font = "50px serif";
        ctx.fillText(this.token, this.x + 10, this.y + this.height/2+20);
        ctx.strokeRect(this.x,this.y,this.w,this.h)

        for (let i = 0; i < this.num_children; i++){
            this.children[i].draw(ctx);
        }
        
    }

    static fromSyntaxTree (tree){
        var num_children = 0
        if (tree.left && tree.right){
            num_children = 2
        }else if (tree.left || tree.right){
            num_children = 1
        }

        const block = new MathBlock(num_children, tree.value)
        if (tree.left){
            block.setChild(0, MathBlock.fromSyntaxTree(tree.left))
        }
        if (tree.right){
            block.setChild(1, MathBlock.fromSyntaxTree(tree.right))
        }
        block.setupChildren()
        return block
    }

    toArray (){
        var arr = [this]
        for (let i = 0; i < this.children.length; i++){
            console.log(this.children[i].token)
            arr = arr.concat(this.children[i].toArray())
        }
        return arr
    }

    

    static derivative(block){

    }

    static associate(block){

    }


}