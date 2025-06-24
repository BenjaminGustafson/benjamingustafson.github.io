
/**
 * 
 * A MathBlock is a draggable rectangle that has a function or operation.
 * 
 */


class MathBlock {

    static VARIABLE = 0 // mx+b
    static POWER = 1    // m[]^2+b
    static EXPONENT = 2 // me^[]+b
    static FUNCTION = 3 // mf([])+b
    static BIN_OP = 4   // m([]+[])+b ?include scale or no... []*[] it would have weird interactions with the inside...
    static CONSTANT = 5 // c

    depth = 0
    
    translate_y = 0
    scale_y = 1
    
    grabbed = false
    attached = false
    parent = null
    child_num = null

    base_width = 50
    base_height = 50
    padding = 10
    w = 50
    h = 50

    on_tool_bar = true

    attach_hover = -1
    
    lineWidth = 5

    manager = null

    prefix = ""
    suffix = ""

    constructor (type, token, origin_x, origin_y){
        // origin_x, _y is where the block is spawned. x,y is where it currently is
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.x = origin_x
        this.y = origin_y
        this.type = type
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
        this.attach_squares = new Array(this.num_children)
        this.token = token
        this.color = Color.white
    }


    checkGrab(x,y){
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    }

    checkAttach(x,y){
        this.attach_hover = -1
        for(let i = 0; i < this.attach_squares.length; i++){
            const a = this.attach_squares[i]
            if (a && x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h){
                this.attach_hover = i
                return {block: this, child:i}
            }
        }
        for(let i = 0; i < this.children.length; i++){
            if (this.children[i]){
                const check = this.children[i].checkAttach(x,y)
                if (check){
                    return check
                }
            }
        }
        return null
    }

    detachFromParent(){
        this.attached = false
        this.parent.children[this.child_num] = null
        this.parent = null
        this.child_num = null
    }

    draw (ctx){
        const ty =  Number(this.translate_y.toFixed(1)) // TODO abstract out slider attachment
        const sy =  Number(this.scale_y.toFixed(1))

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
        //console.log(this.prefix,this.suffix)

        ctx.font = "40px monospace"
        ctx.textBaseline = 'alphabetic'
        ctx.textAlign = 'start'
        switch (this.type){
            case MathBlock.CONSTANT:{
                    const str = ty
                    this.w = ctx.measureText(str).width + this.padding*2
                    Color.setColor(ctx,Color.black)
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth,true)
                    Color.setColor(ctx, this.color)
                    ctx.fillText(str, this.x + this.padding, this.y + this.h/2+10);
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth)
                }
                break
            case MathBlock.VARIABLE:
                const str = this.prefix + this.token + this.suffix 
                this.w = ctx.measureText(str).width + this.padding*2
                Color.setColor(ctx,Color.black)
                Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth,true)
                Color.setColor(ctx, this.color)
                ctx.fillText(str, this.x + this.padding, this.y + this.h/2+10);
                Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth)
                break
            case MathBlock.FUNCTION:{
                var str1 = this.prefix + this.token + "("
                var str2 = ")" + this.suffix
                const w1 = ctx.measureText(str1).width
                const w2 = ctx.measureText(str2).width
                var child_w = this.children[0] ? this.children[0].w : this.base_width
                this.w = w1+w2 + child_w + this.padding*2
                Color.setColor(ctx,Color.black)
                Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth,true)
                if (this.children[0]){
                    this.children[0].draw(ctx)
                    this.h = this.children[0].h + this.padding*2
                    this.children[0].x = this.x+w1+this.padding
                    this.children[0].y = this.y+this.padding
                }else{
                    if (this.attach_hover == 0){
                        Color.setColor(ctx,Color.light_gray)
                    }else{
                        Color.setColor(ctx,Color.gray)
                    }
                    Shapes.Rectangle(ctx, this.x+w1+this.padding,this.y+this.padding,this.base_width,this.base_height,this.lineWidth,true)
                    this.attach_squares[0] = {x:this.x+w1+this.padding,y:this.y+this.padding,w:this.base_width,h:this.base_height}
                    this.h = this.base_height + this.padding*2
                }
                Color.setColor(ctx,Color.white)
                ctx.fillText(str1, this.x + this.padding, this.y + this.h/2+10)
                ctx.fillText(str2, this.x + this.padding + w1 + child_w, this.y + this.h/2+10)
                Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth)
                break
            }
            case MathBlock.POWER:
                {
                    var str1 = this.prefix 
                    var str2 = this.suffix
                    const w1 = ctx.measureText(str1).width +  (sy != 1 ? this.padding  : 0)
                    const w2 = ctx.measureText(str2).width
                    ctx.font = "32px monospace"
                    const w_exp = ctx.measureText(this.token).width
                    var child_w = this.children[0] ? this.children[0].w : this.base_width
                    this.w = w1+w2 + child_w + w_exp + this.padding*3
                    Color.setColor(ctx,Color.black)
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth,true)
                    if (this.children[0]){
                        this.children[0].draw(ctx)
                        this.h = this.children[0].h + this.padding*2 + 12
                        this.children[0].x = this.x+w1+this.padding
                        this.children[0].y = this.y+this.padding+12
                    }else{
                        if (this.attach_hover == 0){
                            Color.setColor(ctx,Color.light_gray)
                        }else{
                            Color.setColor(ctx,Color.gray)
                        }
                        Shapes.Rectangle(ctx, this.x+w1+this.padding,this.y+this.padding+12,this.base_width,this.base_height,this.lineWidth,true)
                        this.attach_squares[0] = {x:this.x+w1+this.padding,y:this.y+this.padding + 12,w:this.base_width,h:this.base_height}
                        this.h = this.base_height + this.padding*2 + 12
                    }
                    Color.setColor(ctx,this.color)
                    ctx.font = "32px monospace"
                    ctx.fillText(this.token, this.x + this.padding*2 + w1 + child_w, this.y+32)
                    ctx.font = "40px monospace"
                    ctx.fillText(str1, this.x + this.padding, this.y + this.h/2+22)
                    ctx.fillText(str2, this.x + this.padding + w1 + child_w + w_exp + 12, this.y + this.h/2+22)
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth)
                }
                break
                case MathBlock.EXPONENT:{
                    /**
                     * ----------------------------------
                     * |                 []             |
                     * |   1*     e               + 2   |
                     * ----------------------------------
                     * |p|w1  |token_w|p?|child_w |p?| w2  |p|
                     * ^ 
                     * x 
                     * 
                     *  TODO: fix this messy code
                     * 
                     */
                    var str1 = this.prefix 
                    var str2 = this.suffix
                    const w1 = ctx.measureText(str1).width +  (sy != 1 ? this.padding  : 0)
                    const w2 = ctx.measureText(str2).width
                    ctx.font = "40px monospace"
                    const token_w = ctx.measureText(this.token).width
                    const token_h = 32
                    const exp_shift = 12
                    var child_w = this.children[0] ? this.children[0].w : this.base_width
                    this.w = w1+w2 + child_w + token_w + this.padding*3
                    // Black background
                    Color.setColor(ctx,Color.black)
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth,true)
                    if (this.children[0]){
                        this.children[0].draw(ctx)
                        this.h = this.children[0].h + this.padding*2 + 12
                        this.children[0].x = this.x+this.padding+w1+token_w+this.padding
                        this.children[0].y = this.y+this.padding
                    }else{
                        // Draw the attachment rectangle
                        if (this.attach_hover == 0){
                            Color.setColor(ctx,Color.light_gray)
                        }else{
                            Color.setColor(ctx,Color.gray)
                        }
                        const sq = {x:this.x+this.padding+w1+token_w+this.padding,y:this.y+this.padding,w:this.base_width,h:this.base_height}
                        this.attach_squares[0] = sq 
                        Shapes.Rectangle(ctx, sq.x,sq.y,sq.w,sq.h,this.lineWidth,true)
                        this.h = this.base_height + this.padding*2 + exp_shift
                    }
                    Color.setColor(ctx,this.color)
                    ctx.fillText(this.token, this.x + this.padding + w1, this.y+this.h-token_h/2)
                    ctx.fillText(str1, this.x + this.padding, this.y+this.h-token_h/2)
                    ctx.fillText(str2, this.x + this.padding + w1 + child_w + token_w + this.padding, this.y+this.h-token_h/2)
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth)
                    }
                    break
                case MathBlock.BIN_OP:{
                    /**
                     * |      prefix (?   [child 0] token [child 1] )? suffix       |
                     *   pad                                                  pad  
                     */
                    Color.setColor(ctx,Color.black)
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth,true)
                    
                    var x = this.x
                    x += this.padding

                    Color.setColor(ctx,this.color)
                    const str1 = this.prefix == "" ? this.prefix : this.prefix + "("
                    ctx.fillText(str1, x, this.y + this.h/2+10)
                    x += ctx.measureText(str1).width

                    if (this.children[0]){
                        this.children[0].draw(ctx)
                        this.h = this.children[0].h + this.padding*2
                        this.children[0].x = x
                        this.children[0].y = this.y+this.padding
                        x += this.children[0].w
                    }else{
                        if (this.attach_hover == 0){
                            Color.setColor(ctx,Color.light_gray)
                        }else{
                            Color.setColor(ctx,Color.gray)
                        }
                        Shapes.Rectangle(ctx, x, this.y+this.padding,this.base_width,this.base_height,this.lineWidth,true)
                        this.attach_squares[0] = {x:x, y:this.y+this.padding, w:this.base_width, h:this.base_height}
                        this.h = this.base_height + this.padding*2
                        x += this.base_width
                    }

                    Color.setColor(ctx,this.color)
                    ctx.fillText(this.token,x, this.y + this.h/2+10)
                    x += ctx.measureText(this.token).width

                    if (this.children[1]){
                        this.children[1].draw(ctx)
                        this.h = Math.max(this.children[1].h + this.padding*2, this.h)
                        this.children[1].x = x
                        this.children[1].y = this.y+this.padding
                        x += this.children[1].w
                    }else{
                        if (this.attach_hover == 1){
                            Color.setColor(ctx,Color.light_gray)
                        }else{
                            Color.setColor(ctx,Color.gray)
                        }
                        Shapes.Rectangle(ctx, x ,this.y+this.padding,this.base_width,this.base_height,this.lineWidth,true)
                        this.attach_squares[1] = {x:x,y:this.y+this.padding,w:this.base_width,h:this.base_height}
                        this.h = Math.max(this.h, this.base_height + this.padding*2)
                        x += this.base_width
                    }

                    Color.setColor(ctx,this.color)
                    const str2 = this.prefix == "" ? this.suffix : ")" + this.suffix
                    ctx.fillText(str2,  x, this.y + this.h/2+10)
                    x += ctx.measureText(str2).width

                    x += this.padding

                    this.w = x - this.x
                    Shapes.Rectangle(ctx, this.x, this.y, this.w, this.h, this.lineWidth)
                }   
                    break
                default:
                    break
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


    /**
     * 
     * Returns null if the function tree is not complete
     * 
     * @param {*} scale 
     * @param {*} offset 
     * @returns 
     */
    toFunction(scale = 1, offset = 0){
        switch(this.type){
            case MathBlock.CONSTANT:
                return x => this.translate_y
            case MathBlock.VARIABLE:
                return (x => this.translate_y + this.scale_y*x)
            case MathBlock.POWER:
                if (this.children[0] != null && this.children[0].toFunction() != null){
                    return (x => (this.translate_y + this.scale_y*(this.children[0].toFunction()(x))**this.token))
                }else{
                    return null
                }
            case MathBlock.EXPONENT:
                if (this.children[0] != null && this.children[0].toFunction() != null){
                    var tokenval = this.token
                    if (this.token == "e"){
                        tokenval = Math.E
                    }
                    return (x => (this.translate_y + this.scale_y*(tokenval**this.children[0].toFunction()(x))))
                }else{
                    return null
                }
            case MathBlock.FUNCTION:
                if (this.children[0] == null || this.children[0].toFunction() == null){
                    return null
                }
                switch (this.token){
                    case "sin":
                        return (x => this.translate_y + this.scale_y*Math.sin(this.children[0].toFunction()(x)))
                    case "cos":
                        return (x => this.translate_y + this.scale_y*Math.cos(this.children[0].toFunction()(x)))
                    default:
                        return null
                }
            case MathBlock.BIN_OP:
                if (this.children[0] == null || this.children[0].toFunction() == null || this.children[1] == null || this.children[1].toFunction() == null){
                    return null
                }
                switch (this.token){
                    case "+":
                        return (x => this.translate_y + this.scale_y*(this.children[0].toFunction()(x) + this.children[1].toFunction()(x)))
                    case "*":
                        return (x => this.translate_y + this.scale_y*(this.children[0].toFunction()(x) * this.children[1].toFunction()(x)))
                    default:
                        return null
                }
            default:
                return null

        }
    }
    


}