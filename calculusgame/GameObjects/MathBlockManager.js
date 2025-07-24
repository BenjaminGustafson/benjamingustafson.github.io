/**
 * 
 * The manager handles how mathblocks attach to each other.
 * It includes "field" which is a rectangle that mathblocks 
 * can attach to.
 * 
 */
class MathBlockManager {

    highlighted = null
    fieldBlock = null
    grabbed = null
    grabMoved = false
    grabX = 0
    grabY = 0
    frozen = false

    constructor (blocks, originX, originY, translateYSlider,scaleYSlider, output){
        this.blocks = blocks
        this.originX = originX
        this.originY = originY
        this.width = 400
        this.height = 50
        this.translateYSlider = translateYSlider
        this.scaleYSlider = scaleYSlider
        blocks.forEach(b => b.manager = this);
        this.field_color = Color.gray
        this.toolBar = []
        this.blocks.forEach(b => {
            this.toolBar.push(b)
        })
        this.output = output
    }

    reset(){
        this.blocks = this.toolBar
        this.fieldBlock = null
        this.highlighted = null
    }

    checkFunctionEquals(f, min=-10, max=10, step=1, precision=0.000001){
        if (this.fieldBlock){
            const g = this.fieldBlock.toFunction()
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

    mouseMoved(mouse){
        
        
        if (this.grabbed){ 
            
        }
    }


    update(ctx, audioManager, mouse){
        if (!this.frozen){
           
        if (this.grabbed != null){ // A mathblock is grabbed
            if (mouse.held){ // The mathblock is being held 
                mouse.cursor = 'grabbing'

                if (!this.grabMoved && mouse.moved){ // The block is moved for the first time
                    
                    this.grabMoved = true
                    if (this.grabbed.parent){ // The block has a parent
                        this.grabbed.detachFromParent()
                    }
                    if (this.fieldBlock == this.grabbed){
                        this.fieldBlock = null
                    }
                    this.toolBar = this.toolBar.filter(o => o != this.grabbed) // remove from toolbar
                }

                // Move the block
                this.grabbed.x = mouse.x - this.grabX
                this.grabbed.y = mouse.y - this.grabY

                if (this.fieldBlock != null){
                    // Call check attach on blocks so they can react appropriately
                    this.fieldBlock.checkAttach(mouse.x,mouse.y)
                } else{
                    // The block hovers over an empty field
                    if (this.checkInField(mouse.x,mouse.y)){
                        if (this.hoverField == false){
                            audioManager.play('click3')
                            this.hoverField = true
                            this.field_color = Color.light_gray
                        }
                    }else{
                        this.hoverField = false
                        this.field_color = Color.gray
                    }
                }

            }else{ // The mathblock is let go
                const g = this.grabbed
                this.grabbed = null
                if (!this.grabMoved){ // The grabbed object was not moved
                    if (!g.attached){
                        // The block was clicked in the tool bar
                        this.toolBar.push(g)
                    }

                }else if (this.fieldBlock == null && this.checkInField(mouse.x, mouse.y)){
                    // Attach to field
                    audioManager.play('switch9')
                    this.fieldBlock = g
                    g.attached = true
                    g.x = this.originX
                    g.y = this.originY
                    if (g.onToolBar){
                        g.onToolBar = false
                        const newG = new MathBlock(g.type,g.token,g.originX,g.originY)
                        this.blocks.push(newG)
                        this.toolBar.push(newG)
                    }
                    

                }else if (g != this.fieldBlock){
                    // Check if there is another block to attach to
                    const attach = this.fieldBlock ? this.fieldBlock.checkAttach(mouse.x,mouse.y) : null
                    if (attach){
                        audioManager.play('switch6')
                        // The block is attaching to another block 
                        attach.block.children[attach.child] = g
                        g.attached = true
                        g.depth = attach.block.depth + 1
                        g.child_num = attach.child
                        g.parent = attach.block
                        if (g.onToolBar){
                            g.onToolBar = false
                            const new_g = new MathBlock(g.type,g.token,g.originX,g.originY)
                            this.blocks.push(new_g)
                            this.toolBar.push(new_g)
                        }
                    }else{
                        audioManager.play('click2')
                        // The block is not attaching to anything
                        if(g.onToolBar){
                            // The block came from the tool bar
                            this.toolBar.push(g)
                            g.x = g.originX
                            g.y = g.originY
                            
                        }else{
                            // The block did not come from the tool bar
                            g.delete()
                            this.blocks = this.blocks.filter(o => !o.deleted)
                        }
                    }
                }

            }
        }else { // No current block grabbed
            var mouseOverBlock = null
            var maxPriority = -1
            // Find the block that the mouse is over with highest grab priority
            this.blocks.forEach(b => {
                if(b.checkGrab(mouse.x,mouse.y)){
                    if (b.depth > maxPriority){
                        maxPriority = b.depth
                        mouseOverBlock = b
                    }
                }
            })

            if (mouseOverBlock != null){
                if (mouse.down){ // Clicked on a block
                    audioManager.play('switch13')
                    this.grabbed = mouseOverBlock
                    this.grabX = mouse.x - this.grabbed.x
                    this.grabY = mouse.y - this.grabbed.y
                    this.grabMoved = false //don't detach the block before it is moved
                    
                    mouse.cursor = 'grabbing'
                    if (this.highlighted){ // Un-highlight old block
                        this.highlighted.color = Color.white
                    }
                    this.highlighted = this.grabbed
                    this.highlighted.color = Color.green
                    this.scaleYSlider.setValue(this.highlighted.scaleY)
                    this.translateYSlider.setValue(this.highlighted.translateY)
                    console.log('Set ', this.translateYSlider.value, this.highlighted.translateY)
                }else{ // Hovering over block
                    mouse.cursor = 'grab'
                }

            }
        }

        // Update values for highlighted block
        if (this.highlighted != null){
            this.highlighted.translateY = this.translateYSlider.value
            this.highlighted.scaleY = this.scaleYSlider.value
        }
        
        
        } // end mouse interaction logic
        



        // Draw
        if (this.fieldBlock){             
            this.fieldBlock.update(ctx, audioManager, mouse)
            const fieldBlock_fun = this.fieldBlock.toFunction()
            // Check that the function is not incomplete
            if (fieldBlock_fun != null){
                if (this.output.type == "fun_tracer"){
                    this.output.fun_tracer.display = true
                    // Set the fun_tracer's function to the fieldblock, and use sliders for scale and translate
                    this.output.fun_tracer.fun = (x => fieldBlock_fun(x))
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
        this.toolBar.forEach(b => b.update(ctx,audioManager,mouse))
        if (this.grabbed){
            this.grabbed.update(ctx,audioManager,mouse)
        }
    }




    checkInField(x,y){
        return x >= this.originX && x <= this.originX + this.width && y >= this.originY && y <= this.originY + this.height
    }


}