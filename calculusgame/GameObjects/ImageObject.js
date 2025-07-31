export class ImageObject{

    constructor(originX,originY,width,height, id){
        this.originX = originX
        this.originY = originY
        this.image = document.getElementById(id)
        this.width = width
        this.height= height
    }

    update(ctx, audioManager, mouse){
        ctx.drawImage(this.image, this.originX, this.originY, this.width, this.height)
    }

}