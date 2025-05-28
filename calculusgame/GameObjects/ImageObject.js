class ImageObject{

    constructor(origin_x,origin_y,width,height, id){
        this.origin_x = origin_x
        this.origin_y = origin_y
        this.image = document.getElementById(id)
        this.width = width
        this.height= height
    }

    draw(ctx){
        ctx.drawImage(this.image, this.origin_x, this.origin_y, this.width, this.height)
    }

}