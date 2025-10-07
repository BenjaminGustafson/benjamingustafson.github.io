



const glowImgIds = ['computerSE','shipSE','labSE', 'alienSE']
const effects = {'in progress':{glowColor:'rgba(255,255,220,1.0)', blurRadius:10, padding:0, strength:3},
                 'complete':{glowColor:'rgba(86,180,233,0.9)', blurRadius:6, padding:0, strength:1}}
const glowImgs = {}
for (let i = 0; i < glowImgIds.length; i ++){
    const img = document.getElementById(glowImgIds[i])
    glowImgs[glowImgIds[i]] = {}
    for (let effect in effects){
        glowImgs[glowImgIds[i]][effect] = createGlowSprite(img, effects[effect])
    }
}

const imgIds = ['computerSE','computerSEBlue','shipSE','labSE','computerSW','computerSWBlue','shipSW','labSW','alienSE','alienSW']
const imgs = {}
for (let i = 0; i < imgIds.length; i ++){
    imgs[imgIds[i]] = document.getElementById(imgIds[i])
}


function createGlowSprite(sourceImage, {glowColor='rgba(255,0,255,0.9)', blurRadius=12, padding=24, strength=2}) {
    const spriteWidth = sourceImage.width
    const spriteHeight = sourceImage.height
  
    // Create a colored mask of the sprite
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = spriteWidth + 2 * padding
    maskCanvas.height = spriteHeight + 2 * padding
    const maskCtx = maskCanvas.getContext('2d')
    maskCtx.drawImage(sourceImage, padding, padding)
    maskCtx.globalCompositeOperation = 'source-in'
    maskCtx.fillStyle = glowColor
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
  
    // Blur the mask
    const blurCanvas = document.createElement('canvas')
    blurCanvas.width = maskCanvas.width
    blurCanvas.height = maskCanvas.height
    const blurCtx = blurCanvas.getContext('2d')
    blurCtx.filter = `blur(${blurRadius}px)`
    for (let i = 0; i<strength; i++)
        blurCtx.drawImage(maskCanvas, 0, 0)
  
    // // Draw the original sprite over the blurred mask
    // blurCtx.filter = 'none';
    // blurCtx.drawImage(sourceImage, padding, padding);
  
    return blurCanvas
}

export class ImageObject{

    constructor({originX,originY,width,height,id,isGlow=false}){
        this.originX = originX
        this.originY = originY
        if (isGlow){
            this.image = glowImgs[id]
        }
        else{
            if (imgs[id])
                this.image = imgs[id]
            else 
                this.image = document.getElementById(id)
        }
        this.width = width != null ? width : this.image.width 
        this.height = height != null ? height : this.image.height 
        this.flip = false
    }

    update(ctx, audioManager, mouse){
        if (this.hidden) return
        ctx.save()
        ctx.translate(this.originX + this.width/2, this.originY+this.height/2)
        if (this.flip){
            ctx.scale(-1,1)
        }
        ctx.drawImage(this.image, -this.width/2,-this.height/2, this.width, this.height)
        ctx.restore()
    }

}