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


    // Really this should go in like an asset loader class
    drawGlowSprite(ctx, img, x, y, {
        glowColor = 'rgba(255,255,0,0.9)',
        radius = 12,
        strength = 2 // extra passes for intensity
      } = {}) {
        // 1) colorize the sprite’s silhouette offscreen
        const off = document.createElement('canvas');
        off.width = img.width; off.height = img.height;
        const octx = off.getContext('2d');
        octx.drawImage(img, 0, 0);
        octx.globalCompositeOperation = 'source-in';
        octx.fillStyle = glowColor;
        octx.fillRect(0, 0, off.width, off.height);
      
        // 2) blur + additive composite as halo
        ctx.save();
        ctx.filter = `blur(${radius}px)`;
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < strength; i++) ctx.drawImage(off, x, y);
        ctx.restore();
      
        // 3) draw the sprite on top
        ctx.drawImage(img, x, y);
    }
}