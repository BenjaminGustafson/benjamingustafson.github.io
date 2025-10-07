import {Color, Shapes} from '../util/index.js'
import { MathBlock } from './MathBlock.js'
import { ImageObject } from './ImageObject.js'
/**
 * 
 * The manager handles how mathblocks attach to each other.
 * It includes "field" which is a rectangle that mathblocks 
 * can attach to.
 * 
 */
export class MathBlockManager {

    /**
     * The current highlighted block (or null).
     * Drawn in green.
     * The sliders set the value of this block.
     */
    highlighted = null

    /**
     * The current block grabbed by the user (or null).
     */
    grabbed = null

    /**
     * True if the grabbed block been moved.
     */
    grabMoved = false

    /**
     * The location on the grabbed block where the mouse 
     * picked it up.
     */
    grabX = 0
    grabY = 0
    
    /**
     * If true, all mathblock interaction stops.
     */
    frozen = false

    constructor ({
        blocks, // The blocks to be supplied to the toolbar
        translateYSlider,
        scaleYSlider,
        numSlider,
        blockFields=[],
        funTracers = [],
        toolBarX = 1400,
        toolBarY = 100,
        blockSize = 40,
    }){
        Object.assign(this,{
            blocks, translateYSlider, scaleYSlider, blockFields, toolBarX,
            toolBarY, blockSize, funTracers, numSlider
        })



        this.createToolbar(blocks, toolBarX, toolBarY)


        const iconSize = 30
        this.scaleIcon = new ImageObject({id:'scaleIcon', originX:scaleYSlider.canvasX - iconSize/4,
            originY:scaleYSlider.canvasY+scaleYSlider.canvasLength + iconSize/2, width: iconSize/2, height:iconSize})
        this.translateIcon = new ImageObject({id:'translateIcon', originX:translateYSlider.canvasX - iconSize/4,
            originY:translateYSlider.canvasY+translateYSlider.canvasLength + iconSize/2, width: iconSize/2, height:iconSize})
        if (numSlider != null){
            this.numIcon = new ImageObject({id:'numIcon', originX:numSlider.canvasX - iconSize/4,
                originY:numSlider.canvasY+numSlider.canvasLength + iconSize/2, width: iconSize/2, height:iconSize})
                
        }
    }

    createToolbar(blocks, originX, originY){
        this.toolBar = []
        for(let i = 0; i < blocks.length; i++){
            blocks[i].onToolBar = true
            blocks[i].originX = originX
            blocks[i].originY = originY + i * (this.blockSize * 2 + 5)
            blocks[i].x = blocks[i].originX
            blocks[i].y = blocks[i].originY
            blocks[i].baseSize = this.blockSize
            this.toolBar.push(blocks[i])
        }
    }


    mouseInput(mouse, audioManager){
        if (this.frozen){
            return
        }
        
        // A mathblock is currently grabbed
        if (this.grabbed != null){

            // The grabbed mathblock is still held 
            if (mouse.held){
                mouse.cursor = 'grabbing'

                // The block is moved for the first time
                if (!this.grabMoved && mouse.moved){
                    this.grabMoved = true
                    
                    // Detach from parent block
                    if (this.grabbed.parent != null){
                        this.grabbed.detachFromParent()
                    }
                    // Detach from toolbar
                    else if (this.grabbed.onToolBar){
                        this.toolBar = this.toolBar.filter(o => o != this.grabbed) 
                    } 
                    // Detach from field 
                    else if (this.grabbed.rootOfField != null){
                        this.grabbed.rootOfField.rootBlock = null
                    }
                }

                // Move the block
                this.grabbed.x = mouse.x - this.grabX
                this.grabbed.y = mouse.y - this.grabY

                // Check if the grabbed block is hovering over something 
                this.blockFields.forEach(field => {
                    // Check hover over other blocks
                    if (field.rootBlock != null){
                        field.rootBlock.checkAttach(this.grabbed.x,this.grabbed.y,this.grabbed.w,this.grabbed.h)
                    } 
                    // Check hover over an empty field
                    else {
                        field.checkAttach(this.grabbed)
                    }
                })
            }
            // The mathblock is let go
            else{ 
                const g = this.grabbed
                this.grabbed.grabbed = false
                this.grabbed = null
                // The grabbed block was moved
                if (this.grabMoved){

                    var isAttaching = false

                    // For each blockField
                    for (let i = 0; i < this.blockFields.length; i++){
                        const field = this.blockFields[i]

                        //There is no root
                        if (field.rootBlock == null ){
                            // Attach to field
                            if (field.checkAttach(g)){
                                audioManager.play('switch9')
                                field.rootBlock = g
                                g.attached = true
                                g.rootOfField = field
                                g.x = field.minX
                                g.y = field.minY
                                isAttaching = true
                                break
                            }
                        } 
                        // There is a root
                        else {
                            const attachObj = field.rootBlock.checkAttach(g.x,g.y,g.w,g.h)
                            // There is a block to attach to
                            if (attachObj != null){
                                audioManager.play('switch6')
                                attachObj.block.setChild(attachObj.childIndex, g)
                                isAttaching = true
                                break
                            }
                        }
                    }

                    // Found something to attach block to
                    if (isAttaching){
                        if (g.onToolBar){
                            g.onToolBar = false
                            const newG = new MathBlock({type:g.type,token:g.token,originX:g.originX,originY:g.originY,baseSize:this.blockSize})
                            //this.blocks.push(newG)
                            newG.onToolBar = true
                            this.toolBar.push(newG)
                        }
                    }
                    // The block is not attaching to anything
                    else{
                        // The block came from the toolbar: put it back
                        if(g.onToolBar){
                            this.toolBar.push(g)
                            g.x = g.originX
                            g.y = g.originY

                        // The block did not come from the tool bar: delete it
                        }else{
                            audioManager.play('click2')
                            this.highlighted = null
                            // g.delete()
                            // this.blocks = this.blocks.filter(o => !o.deleted)
                        }
                    }
                }
            }
        }
        // No current block grabbed
        else {
            var mouseOverBlock = null

            // Check mouse over field blocks
            for (let i = 0; i < this.blockFields.length; i++){
                const field = this.blockFields[i]
                if (field == null || field.rootBlock == null) continue

                const res = field.rootBlock.checkGrabRecursive(mouse.x, mouse.y)
                if (res != null){
                    mouseOverBlock = res
                    break
                }
            }

            // Check mouse over toolbar
            this.toolBar.forEach(block => {
                if (block.checkGrab(mouse.x, mouse.y)){
                    mouseOverBlock = block
                }
            })

            // Mouse is over a block
            if (mouseOverBlock != null){
                // Clicked on a block
                if (mouse.down){ 
                    audioManager.play('switch13')
                    this.grabbed = mouseOverBlock
                    this.grabbed.grabbed = true
                    mouse.cursor = 'grabbing'

                    // The position on the block that the mouse grabbed it from
                    this.grabX = mouse.x - this.grabbed.x
                    this.grabY = mouse.y - this.grabbed.y

                    // Prevent the block from detaching before it is moved
                    this.grabMoved = false
                    
                    // Un-highlight old block
                    if (this.highlighted != null) this.highlighted.isHighlighted = false

                    // Set new highlighted block
                    this.highlighted = this.grabbed
                    this.highlighted.isHighlighted = true
                    
                    
                    // Set sliders to highlighted block
                    if (this.highlighted.type != MathBlock.CONSTANT){
                        this.scaleYSlider.setValue(this.highlighted.scaleY)
                    }
                    this.translateYSlider.setValue(this.highlighted.translateY)
                }
                // Hovering over block
                else{
                    mouse.cursor = 'grab'
                }
            }
        }
    }



    update(ctx, audioManager, mouse){
        // Handle mouse logic
        this.mouseInput(mouse, audioManager)

        // Update slider values for highlighted block
        if (!this.frozen && this.highlighted != null){
            this.scaleYSlider.active = this.highlighted.type != MathBlock.CONSTANT
            this.translateYSlider.active = true
            this.highlighted.translateY = this.translateYSlider.value
            this.highlighted.scaleY = this.scaleYSlider.value
            if (this.numSlider != null && (this.highlighted.type == MathBlock.EXPONENT || this.highlighted.type == MathBlock.POWER) ) {
                this.highlighted.token = Number(this.numSlider.value.toFixed(6))
            }
        }else{
            this.scaleYSlider.active = false
            this.translateYSlider.active = false
        }

        // Update fields
        this.blockFields.forEach(field => field.update(ctx, audioManager, mouse))

        // Update blocks in toolbar
        this.toolBar.forEach(b => b.update(ctx,audioManager,mouse))
        if (this.grabbed != null){
            this.grabbed.update(ctx,audioManager,mouse)
        }

        // Update outputs
        for (let i = 0; i < this.funTracers.length; i++){
            this.funTracers[i].setInputFunction(this.blockFields[i].outputFunction())   
        }


        if (!this.scaleYSlider.hidden) this.scaleIcon.update(ctx)
        if (!this.translateYSlider.hidden) this.translateIcon.update(ctx)
        if (this.numIcon != null) this.numIcon.update(ctx)
       
    }

    reset(){
        this.grabbed = null
        this.highlighted = null
        this.blockFields.forEach(f => f.rootBlock = null)
    }

}

export class MathBlockField {

    constructor({
        minX, minY, maxX, maxY
    }){
        Object.assign(this, {
            minX, minY, maxX, maxY
        })
        this.rootBlock = null
        this.width = maxX - minX
        this.height = maxY - minY
        this.baseColor = Color.black
        this.hoverColor = Color.gray
        this.isHovered = false
    }

    update(ctx, audioManager, mouse){
        Color.setColor(ctx,this.isHovered ? this.hoverColor : this.baseColor)
        Shapes.Rectangle({ctx:ctx,originX:this.minX,originY:this.minY,width:this.width,height:this.height,recessed:true})
        this.isHovered = false
        if (this.rootBlock == null){
            
        }else{
            ctx.save()
            ctx.beginPath()
            ctx.rect(this.minX, this.minY, this.width, this.height)
            ctx.clip()
            this.rootBlock.update(ctx, audioManager, mouse)
            ctx.restore()
        }
    }


    checkAttach(block){
        const inBounds =  block.x <= this.maxX && 
            block.x + block.w >= this.minX &&
            block.y <= this.maxY &&
            block.y + block.h >= this.minY
        if (inBounds){
            this.isHovered = true
        }
        return inBounds
    }

    outputFunction(){
        if (this.rootBlock == null) return x => 0
        const fun = this.rootBlock.toFunction()
        if (fun == null) return x => 0
        return fun
    }
}