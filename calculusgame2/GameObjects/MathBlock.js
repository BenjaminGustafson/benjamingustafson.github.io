import {Color, Shapes} from '../util/index.js'

/**
 * 
 * A MathBlock is a draggable rectangle that has a function or operation.
 * MathBlocks can nest in each other to form more complex functions.
 * MathBlocks are an input option for defining a function in a puzzle.
 * 
 * 
 */


export class MathBlock {

    static VARIABLE = 0 // m x +b
    static POWER = 1    // m []^2 +b
    static EXPONENT = 2 // m e^[] +b
    static FUNCTION = 3 // m f([]) +b
    static BIN_OP = 4   // []+[]
    static CONSTANT = 5 // c
    static FRACTION = 6 // [] / []

    depth = 0
    
    translateY = 0
    scaleY = 1
    
    grabbed = false

    attached = false
    parent = null
    /**
     * If this block is a child, selfChildIndex is the index of this block
     * in its parent's children array.
     */
    selfChildIndex = null

    padding = 7
    w = 50
    h = 50

    /**
     * The block is currently on the toolbar, or was just grabbed
     * from the toolbar.
     */
    onToolBar = false

    /**
     * The MathBlockField that the block is the root of.
     * Or null if the block is not the root.
     */
    rootOfField = null

    attachHover = -1
    
    lineWidth = 1.5

    manager = null

    prefix = ""
    suffix = ""

    deleted = false

    constructor ({
        type, token = "",
        originX = -100, originY = -100,
        baseSize = 26,
    }){
        // originX, _y is where the block is spawned. x,y is where it currently is
        Object.assign(this, {type, token, originX, originY, baseSize})
        this.x = originX
        this.y = originY
        switch (type){
            case MathBlock.POWER:
            case MathBlock.EXPONENT:
            case MathBlock.FUNCTION:
                this.num_children = 1
                break
            case MathBlock.BIN_OP:
                this.num_children = 2
                break
            case MathBlock.CONSTANT:
            default:
                this.num_children = 0
                break
        }
        this.children = new Array(this.num_children)
        /**
         * Attach squares are objects of the form {x,y,w,h}.
         */
        this.attachSquares = new Array(this.num_children)
        this.token = token 
        this.lineColor = Color.white
        this.bgColor = Color.darkBlack
        this.isHighlighted = false
        this.asString = ""

        /**
         * If an attach square is currently hovered over, this.attachHover
         * is be the index of that square. This is used when we draw the attach squares.
         * 
         * If no attach square is hovered over, it is null.
         */
        this.attachHover = null

        this.formatType = "inline"
        this.content = []

    }

    static rehydrate(block) {
        const obj = new MathBlock({})
    
        // Only copy primitive / safe fields
        obj.type = block.type
        obj.token = block.token
        obj.scaleY = block.scaleY
        obj.translateY = block.translateY
        obj.x = block.x
        obj.y = block.y
    
        obj.children = []
        for (let i = 0; i < block.children.length; i++) {
            if (block.children[i] != null) {
                const child = MathBlock.rehydrate(block.children[i])
                obj.setChild(i, child)
            }
        }
    
        return obj
    }
    

    static dehydrate(mathBlock){
        const children = []
        mathBlock.children.forEach(c => children.push(MathBlock.dehydrate(c)))
        return {
            'type':mathBlock.type,
            'token':mathBlock.token,
            'scaleY':mathBlock.scaleY,
            'translateY':mathBlock.translateY,
            'x':mathBlock.x,
            'y':mathBlock.y,
            'children': children,
        }
     }

    checkGrab(x,y){
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    }

    checkGrabRecursive(x,y)
    {   
        if (this.checkGrab(x,y)){
            for (let i = 0; i < this.num_children; i++){
                const c = this.children[i]
                if (c == null) continue

                const res = c.checkGrabRecursive(x,y)
                if (res != null){
                    return res
                }
            }
            return this
        }else{
            return null 
        }
    }

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    checkAttach(x,y,w,h){
        this.attachHover = -1
        for(let i = 0; i < this.children.length; i++){
            if (this.children[i] != null){
                const check = this.children[i].checkAttach(x,y,w,h)
                if (check != null){
                    return check
                }
            }else{
                const a = this.attachSquares[i]
                if (x + w >= a.x && x <= a.x + a.w && y + h >= a.y && y <= a.y + a.h){
                    this.attachHover = i
                    return {block: this, childIndex:i}
                }
            }
        }
        return null
    }

    setChild(i, child){
        this.children[i] = child
        child.attached = true
        child.depth = this.depth + 1
        child.selfChildIndex = i
        child.parent = this
    }

    detachFromParent(){
        this.attached = false
        this.parent.children[this.selfChildIndex] = null
        this.parent = null
        this.selfChildIndex = null
    }

    calculateSize(ctx){
        ctx.font = this.baseSize+"px monospace"
        this.w = this.padding
        this.h = this.padding * 2 + this.baseSize
        this.content.forEach( obj => {
            if (obj.type == 'string'  && obj.string.length > 0){
                this.w += ctx.measureText(obj.string).width + this.padding 
            }else if (obj.type == 'child'){
                const child = this.children[obj.childIndex]
                if (child != null){
                    child.calculateSize(ctx)
                    this.w += child.w + this.padding
                    this.h = Math.max(this.h, child.h + this.padding*2)
                }else{ // Attach square
                    this.w += this.baseSize + this.padding
                    this.h = Math.max(this.h, this.baseSize + this.padding * 2)
                }
            }
        })
    }

    draw(ctx){
        ctx.font = this.baseSize+"px monospace"
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'

        const bgColor = this.bgColor
        const lineColor = this.isHighlighted ? Color.green : this.lineColor
        const textColor = this.isHighlighted ? Color.green : this.lineColor
        Color.setFill(ctx, bgColor)
        Color.setStroke(ctx,lineColor)
        //ctx.fillRect(this.x,this.y, this.w, this.h)
        Shapes.Rectangle({ctx:ctx, originX:this.x, originY:this.y, width:this.w, height:this.h,
            lineWidth:this.lineWidth, 
            stroke: !this.onToolBar, 
            shadow: this.grabbed ? 8 : !this.parent ? 2 : 0,
            inset: !this.parent,
            radius : 4
        })
        var contentX = this.x + this.padding
        const middleY = this.y + this.h/2
        this.content.forEach( obj => {
            if (obj.type == 'string' && obj.string.length > 0){
                Color.setColor(ctx,textColor)
                ctx.fillText(obj.string, contentX, middleY)
                contentX += ctx.measureText(obj.string).width + this.padding
            }else if (obj.type == 'child'){
                const child = this.children[obj.childIndex]
                if (child != null){
                    child.x = contentX
                    child.y = middleY - child.h/2
                    child.draw(ctx)
                    contentX += child.w + this.padding
                }else{ // Attach square
                    if (obj.childIndex == this.attachHover){
                        Color.setFill(ctx, Color.adjustLightness(bgColor, 150))
                    }else{
                        Color.setFill(ctx, Color.adjustLightness(bgColor, 40))
                    }
                    const square = {x: contentX, y: middleY - this.baseSize/2, w: this.baseSize, h:this.baseSize}
                    this.attachSquares[obj.childIndex] = square
                    Shapes.Rectangle({ctx:ctx, originX:square.x, originY:square.y, width:square.w, height:square.h, recessed:true})
                    contentX += this.baseSize + this.padding
                }
            }
        })

    }

    setContent(){
        const ty =  Number(this.translateY.toFixed(6))
        const sy =  Number(this.scaleY.toFixed(6))

        console.log(ty)

        this.prefix = ""
        this.suffix = ""
        if (sy != 1){
            if (sy == -1){
                this.prefix = "-"
            }else{
                this.prefix = sy.toString()
            }
            if (sy == 0){
                this.prefix = "0"
            }
        }
        if (ty != 0){
            if (ty < 0 ){
                this.suffix = ty.toString()
            }else{
                this.suffix = "+" + ty.toString()
            }
        }

        switch (this.type){
            case MathBlock.CONSTANT:{
                    this.content = [{type:'string', string:ty.toString()}]
                }
                break
            case MathBlock.VARIABLE:
                this.content = [{type:'string', string:this.prefix + this.token + this.suffix}]
                break
            case MathBlock.FUNCTION:{
                this.content = [
                    {type:'string', string:this.prefix + this.token },
                    {type:'child', childIndex:0},
                    {type:'string', string: this.suffix}]
            }
            break
            case MathBlock.POWER:{
                this.content = [{type:'string', string:this.prefix},{type:'child', childIndex:0},{type:'string', string:'^' + this.token + this.suffix}] // todo
            }
                break
            case MathBlock.EXPONENT:{
                this.content = [{type:'string', string:this.prefix + this.token + '^'},{type:'child', childIndex:0},{type:'string', string:this.suffix}]
            }
                break
            case MathBlock.BIN_OP:{
                this.content = [
                    {type:'string', string:this.prefix + (this.prefix == '' ? '' : '(')},
                    {type:'child', childIndex:0},
                    {type:'string', string:this.token},
                    {type:'child', childIndex:1},
                    {type:'string', string: (this.prefix == '' ? '' : ')')+this.suffix},]
            }   
                break
            default:
                break
        }
        this.children.forEach( c => {
            if (c != null){
                c.setContent()
            }
        })
    }

    delete(){
        this.children.forEach(c => {if (c) c.delete()})
        this.deleted = true
    }

    /**
     * Recursively calls on children; only call update on root block
     */
    update(ctx, audioManager, mouse){
       this.setContent()
       this.calculateSize(ctx)
       this.draw(ctx)
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


    /**
     * 
     * Returns null if the function tree is not complete
     * 
     * @param {*} scale 
     * @param {*} offset 
     * @returns 
     */
    toFunction(constants={}){
        switch(this.type){
            case MathBlock.CONSTANT:
                return x => this.translateY
            case MathBlock.VARIABLE:
                if (constants[this.token] != null){
                    return x => this.translateY + this.scaleY*constants[this.token]
                }
                return (x => this.translateY + this.scaleY*x)
            case MathBlock.POWER:
                if (this.children[0] != null && this.children[0].toFunction(constants) != null){
                    return (x => (this.translateY + this.scaleY*(this.children[0].toFunction(constants)(x))**this.token))
                }else{
                    return null
                }
            case MathBlock.EXPONENT:{
                if (this.children[0] != null && this.children[0].toFunction(constants) != null){
                    const base = this.token == 'e' ? Math.E : Number(this.token)
                    return (x => (this.translateY + this.scaleY*Math.pow(base,(this.children[0].toFunction(constants)(x)))))
                }else{
                    return null
                }
            }
            case MathBlock.FUNCTION:
                if (this.children[0] == null || this.children[0].toFunction(constants) == null){
                    return null
                }
                switch (this.token){
                    case "sin":
                        return (x => this.translateY + this.scaleY*Math.sin(this.children[0].toFunction(constants)(x)))
                    case "cos":
                        return (x => this.translateY + this.scaleY*Math.cos(this.children[0].toFunction(constants)(x)))
                    default:
                        return null
                }
            case MathBlock.BIN_OP:
                if (this.children[0] == null || this.children[0].toFunction(constants) == null || this.children[1] == null || this.children[1].toFunction(constants) == null){
                    return null
                }
                switch (this.token){
                    case "+":
                        return x =>  this.translateY + this.scaleY*(this.children[0].toFunction(constants)(x) + this.children[1].toFunction(constants)(x))
                    case "*":
                        return x =>  this.translateY + this.scaleY*(this.children[0].toFunction(constants)(x) * this.children[1].toFunction(constants)(x))
                    case "/":
                        return x =>  this.translateY + this.scaleY*(this.children[0].toFunction(constants)(x) / this.children[1].toFunction(constants)(x))
                    default:
                        return null
                }
            default:
                return null

        }
    }

}