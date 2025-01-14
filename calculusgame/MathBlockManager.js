/**
 * 
 * The manager handles how mathblocks attach to each other.
 * 
 * 
 */
class MathBlockManager {

    highlighted = null
    field_block = null
    grabbed = null
    grab_moved = false
    grab_x = 0
    grab_y = 0

    constructor (blocks, field_x, field_y, translate_y_slider,scale_y_slider,tracer){
        this.blocks = blocks
        this.field_x = field_x
        this.field_y = field_y
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
        this.tracer = tracer
    }


    draw(ctx){
        if (this.field_block){             
            this.field_block.draw(ctx)
            const field_block_fun = this.field_block.toFunction()
            // Check that the function is not incomplete
            if (field_block_fun != null){
                this.tracer.display = true
                // Set the tracer's function to the fieldblock, and use sliders for scale and translate
                this.tracer.fun = (x => field_block_fun(x))
            }else{
                // Set display false so that we don't evaluate the incomplete function
                this.tracer.display = false
            }
        }else{
            // If there is no fieldblock, we cannot trace the function
            this.tracer.display = false
            // Draw the placeholder for the block
            Color.setColor(ctx,this.field_color)
            Shapes.Rectangle(ctx,this.field_x,this.field_y,this.width,this.height,10,true)
        }
        this.tool_bar.forEach(b => b.draw(ctx))
        if (this.grabbed){
            this.grabbed.draw(ctx)
        }
    }


    mouseMove(x,y){
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
        return x >= this.field_x && x <= this.field_x + this.width && y >= this.field_y && y <= this.field_y + this.height
    }


    mouseUp(x,y){
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
                console.log('aaa')
                // The block is over the field and the field is empty
                this.field_block = this.grabbed
                this.grabbed.attached = true
                this.grabbed.x = this.field_x
                this.grabbed.y = this.field_y
                if (g.on_tool_bar){
                    g.on_tool_bar = false
                    const new_g = new MathBlock(g.type,g.token,g.origin_x,g.origin_y)
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
                        const new_g = new MathBlock(g.type,g.token,g.origin_x,g.origin_y)
                        this.blocks.push(new_g)
                        this.tool_bar.push(new_g)
                    }
                }else{
                    // The block is not attaching to anything
                    if(g.on_tool_bar){
                        // The block came from the tool bar
                        this.tool_bar.push(this.grabbed)
                        this.grabbed.x = this.grabbed.origin_x
                        this.grabbed.y = this.grabbed.origin_y
                        
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