/**
 * 
 * The manager handles how mathblocks attach to each other.
 * It includes "field" which is a rectangle that mathblocks 
 * can attach to.
 * 
 */
class MathBlockManager {

    highlighted = null
    field_block = null
    grabbed = null
    grab_moved = false
    grab_x = 0
    grab_y = 0
    frozen = false

    constructor (blocks, originX, originY, translate_y_slider,scale_y_slider, output){
        this.blocks = blocks
        this.originX = originX
        this.originY = originY
        this.width = 400
        this.height = 50
        this.translate_y_slider = translate_y_slider
        this.scale_y_slider = scale_y_slider
        blocks.forEach(b => b.manager = this);
        this.field_color = Color.gray
        this.tool_bar = []
        this.blocks.forEach(b => {
            this.tool_bar.push(b)
        })
        this.output = output
    }

    reset(){
        this.blocks = this.tool_bar
        this.field_block = null
        this.highlighted = null
    }

    checkFunctionEquals(f, min=-10, max=10, step=1, precision=0.000001){
        if (this.field_block){
            const g = this.field_block.toFunction()
            if (g){
                for (let x = min; x < max; x+= step){
                    if (Math.abs(g(x) - f(x)) > precision){
                        return false
                    }
                }
                return true
            }
            
        }
        return false
    }

    update(ctx, audioManager, mouse){
        if (this.field_block){             
            this.field_block.draw(ctx)
            const field_block_fun = this.field_block.toFunction()
            // Check that the function is not incomplete
            if (field_block_fun != null){
                if (this.output.type == "fun_tracer"){
                    this.output.fun_tracer.display = true
                    // Set the fun_tracer's function to the fieldblock, and use sliders for scale and translate
                    this.output.fun_tracer.fun = (x => field_block_fun(x))
                }else if (this.output.type == "sliders"){

                }
            }else{
                // Set display false so that we don't evaluate the incomplete function
                if (this.output.type == "fun_tracer"){
                    this.output.fun_tracer.display = false
                }
            }
        }else{
            // If there is no fieldblock, we cannot trace the function
            if (this.output.type == "fun_tracer"){
                this.output.fun_tracer.display = false
            }
            // Draw the placeholder for the block
            Color.setColor(ctx,this.field_color)
            Shapes.Rectangle(ctx,this.originX,this.originY,this.width,this.height,10,true)
        }
        this.tool_bar.forEach(b => b.draw(ctx))
        if (this.grabbed){
            this.grabbed.draw(ctx)
        }
    }


    mouseMove(x,y){
        if (this.frozen){
            return
        }
        if (this.highlighted){
            this.highlighted.translate_y = this.translate_y_slider.value
            this.highlighted.scale_y = this.scale_y_slider.value
        }
        
        if (this.field_block){
            
        }else if (this.grabbed && this.checkInField(x,y)){
            this.field_color = Color.light_gray
        }else{
            this.field_color = Color.gray
        }
        var cursor = null
        if (this.grabbed){
            cursor = 'grabbing'
            if (!this.grab_moved){
                // The grabbed object has now been moved
                this.grab_moved = true
                if (this.grabbed.parent){
                    // The block has a parent
                    this.grabbed.detachFromParent()
                }
                if (this.field_block == this.grabbed){
                    this.field_block = null
                }
            }
            this.grabbed.x = x - this.grab_x
            this.grabbed.y = y - this.grab_y
            if (this.field_block){
                this.field_block.checkAttach(x,y)
            }
        }else {
            this.blocks.forEach(b => {
                if (b.checkGrab(x,y)){
                    cursor = 'grab'
                }
            })
            
        }
        return cursor
    }

    mouseDown(x,y){
        if (this.frozen){
            return
        }
        this.mouseIsDown = true
        var cursor = null
        var top_priority = -1
        var flag = false
        // check if a block is being grabbed
        this.blocks.forEach(b => {
            if(b.checkGrab(x,y)){
                flag = true
                if (top_priority < b.depth){
                    top_priority = b.depth
                    this.grabbed = b 
                }
            }
        })
        if (flag){
            this.grab_x = x - this.grabbed.x
            this.grab_y = y - this.grabbed.y
            this.grab_moved = false//don't detach the block before it is moved
            this.tool_bar = this.tool_bar.filter(o => o != this.grabbed)
            cursor = 'grabbing'
            if (this.highlighted){
                this.highlighted.color = Color.white
            }
            this.highlighted = this.grabbed
            this.highlighted.color = Color.green
            this.scale_y_slider.setValue(this.highlighted.scale_y)
            this.translate_y_slider.setValue(this.highlighted.translate_y)
        }
        return cursor
    }

    checkInField(x,y){
        return x >= this.originX && x <= this.originX + this.width && y >= this.originY && y <= this.originY + this.height
    }


    mouseUp(x,y){
        if (this.frozen){
            return
        }
        this.mouseIsDown = false
        
        if (this.grabbed){ 
            const g = this.grabbed
            // There was something grabbed, now release it
            if (!this.grab_moved){
                // The grabbed object was not moved
                if (!g.attached){
                    // The block was clicked in the tool bar
                    this.tool_bar.push(g)
                }
            }else if (this.field_block == null && this.checkInField(x, y)){
                // The block is over the field and the field is empty
                this.field_block = this.grabbed
                this.grabbed.attached = true
                this.grabbed.x = this.originX
                this.grabbed.y = this.originY
                if (g.on_tool_bar){
                    g.on_tool_bar = false
                    const new_g = new MathBlock(g.type,g.token,g.originX,g.originY)
                    this.blocks.push(new_g)
                    this.tool_bar.push(new_g)
                }
                

            }else if (g == this.field_block){
                // The block was the field and now the field is empty                

            }else{

                const attach = this.field_block ? this.field_block.checkAttach(x,y) : null
                if (attach){
                    // The block is attaching to another block 
                    attach.block.children[attach.child] = g
                    g.attached = true
                    g.depth = attach.block.depth + 1
                    g.child_num = attach.child
                    g.parent = attach.block
                    if (g.on_tool_bar){
                        g.on_tool_bar = false
                        const new_g = new MathBlock(g.type,g.token,g.originX,g.originY)
                        this.blocks.push(new_g)
                        this.tool_bar.push(new_g)
                    }
                }else{
                    // The block is not attaching to anything
                    if(g.on_tool_bar){
                        // The block came from the tool bar
                        this.tool_bar.push(this.grabbed)
                        this.grabbed.x = this.grabbed.originX
                        this.grabbed.y = this.grabbed.originY
                        
                    }else{
                        // The block did not come from the tool bar
                        this.blocks = this.blocks.filter(o => o != g)
                    }
                }
            }
        } 
        this.grabbed = null

        var cursor = null
        this.blocks.forEach(b => {
            if (b.checkGrab(x,y)){
                cursor = 'grab'
            }
        })
        return cursor
    }


}