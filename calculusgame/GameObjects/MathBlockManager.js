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

    constructor ({blocks=[], originX, originY, translateYSlider,scaleYSlider,
        outputType="funTracer", funTracer, attachFields =[], maxY
    }){
        Object.assign(this,{
            blocks, originX, originY, translateYSlider, scaleYSlider, outputType, funTracer,
            attachFields
        })
        this.width = 400
        this.height = 50
        blocks.forEach(b => b.manager = this);
        this.field_color = Color.gray
        this.toolBar = []
        this.blocks.forEach(b => {
            this.toolBar.push(b)
        })
        this.maxY = this.originY + this.height
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
                    this.fieldBlock.checkAttach(this.grabbed.x,this.grabbed.y,this.grabbed.w,this.grabbed.h)
                } else{
                    // The block hovers over an empty field
                    if (this.checkInField(this.grabbed.x,this.grabbed.y,this.grabbed.w,this.grabbed.h)){
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

                }else if (this.fieldBlock == null && this.checkInField(g.x, g.y, g.w, g.h)){
                    // Attach to field
                    audioManager.play('switch9')
                    this.fieldBlock = g
                    g.attached = true
                    g.x = this.originX
                    g.y = this.originY
                    if (g.onToolBar){
                        g.onToolBar = false
                        const newG = new MathBlock({type:g.type,token:g.token,originX:g.originX,originY:g.originY})
                        this.blocks.push(newG)
                        this.toolBar.push(newG)
                    }
                    

                }else if (g != this.fieldBlock){
                    // Check if there is another block to attach to
                    const attachObj = this.fieldBlock ? this.fieldBlock.checkAttach(g.x,g.y,g.w,g.h) : null
                    if (attachObj != null){
                        // The block is attaching to another block 
                        audioManager.play('switch6')
                        const attachBlock = attachObj.block
                        const childIndex = attachObj.childIndex
                        attachBlock.setChild(childIndex, g)
                        
                        if (g.onToolBar){
                            g.onToolBar = false
                            const new_g = new MathBlock({type:g.type,token:g.token,originX:g.originX,originY:g.originY})
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
                        this.highlighted.isHighlighted = false
                    }
                    this.highlighted = this.grabbed
                    this.highlighted.isHighlighted = true
                    if (this.highlighted.type == MathBlock.CONSTANT){
                        this.scaleYSlider.active = false
                    }else{
                        this.scaleYSlider.active = true
                        this.scaleYSlider.setValue(this.highlighted.scaleY)
                    }
                    this.translateYSlider.setValue(this.highlighted.translateY)
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
            this.fieldBlock.y = this.maxY - this.fieldBlock.h
            this.fieldBlock.update(ctx, audioManager, mouse)
            const fieldBlock_fun = this.fieldBlock.toFunction()
            // Check that the function is not incomplete
            if (fieldBlock_fun != null){
                console.log(fieldBlock_fun(1))
                if (this.outputType == "funTracer"){
                    this.funTracer.display = true
                    // Set the funTracer's function to the fieldblock, and use sliders for scale and translate
                    this.funTracer.fun = fieldBlock_fun
                }else if (this.outputType == "sliders"){

                }
            }else{
                // Set display false so that we don't evaluate the incomplete function
                if (this.outputType == "funTracer"){
                    this.funTracer.display = false
                }
            }
        }else{
            // If there is no fieldblock, we cannot trace the function
            if (this.outputType == "funTracer"){
                this.funTracer.display = false
            }
            // Draw the placeholder for the block
            Color.setColor(ctx,this.field_color)
            Shapes.Rectangle(ctx,this.originX,this.originY,this.width,this.height,10,true)
        }


        this.toolBar.forEach(b => b.update(ctx,audioManager,mouse))
        if (this.grabbed != null){
            this.grabbed.update(ctx,audioManager,mouse)
        }
    }




    checkInField(x,y,w,h){
        return x <= this.originX + this.width && 
               x + w >= this.originX &&
               y <= this.originY + this.height &&
               y + h >= this.originY
    }


}

class MathBlockField {


    constructor({
        minX, minY, maxX, maxY, rootBlock
    }){
    }

    outputFunction(){

    }
}