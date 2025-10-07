
/**
 * Extra drawing methods for commonly used shapes.
 */
export class Shapes {
    
    /**
     * TODO: Could you not just use the built in endCap? There's no arrow option, so whats 
     * the best way to handle that?
     * 
     * @param {context} ctx the context of the canvas to draw on
     * @param {int} originX the x coordinate of the middle of the start point
     * @param {int} originY the y coordinate of the middle of the start point
     * @param {int} end_x the x coordinate of the middle of the end point
     * @param {int} end_y the y coordinate of the middle of the end point
     * @param {int} width the width of the line
    */
    static Line(ctx, originX, originY, end_x, end_y, width, endCapStyle="none", endCapSize=-1,oneSideCap=false){
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(end_x, end_y);
        ctx.lineWidth = width;
        ctx.stroke();
        
        if (endCapSize == -1){
            endCapSize = width
        }

        switch (endCapStyle){
            case "rounded":
                ctx.beginPath();
                ctx.arc(originX,originY,width/2,0,2*Math.PI);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(end_x,end_y,width/2,0,2*Math.PI);
                ctx.fill();
                break;
            case "arrow":
                this.Arrow(ctx, originX, originY, end_x, end_y, endCapSize*0.7)
                if(!oneSideCap){
                    this.Arrow(ctx, end_x, end_y, originX, originY,endCapSize*0.7)
                }
                break;
            case "none":
            default:
                break;    
        }

        
    }

    static shadowsOn(ctx){
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
    }

    static shadowsOff(ctx){
        ctx.shadowColor = 'transparent';
    }

    // /**
    //  * A rectangle with rounded corners.
    //  */
    // static Rectangle({ctx,originX,originY,width,height,
    //     lineWidth=5,fill=true,shadow=false,stroke=false, radius=5
    // }){
    //     ctx.lineWidth = lineWidth
    //     ctx.beginPath()
    //     ctx.roundRect(originX, originY, width, height, radius)
    //     if (fill){
    //         if (shadow){
    //             this.shadowsOn(ctx)
    //         }
    //         ctx.fill()
    //         if (shadow){
    //             this.shadowsOff(ctx)
    //         }
    //     }
    //     if (stroke){
    //         ctx.stroke()
    //     }
    // }

    static Rectangle({ctx, originX, originY, width, height,
        lineWidth = 5, fill = true, shadow = 0, stroke = false, radius = 5,
        inset = false, recessed = false
    }) {
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.roundRect(originX, originY, width, height, radius);
    
        if (fill) {
            if (shadow != 0) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = shadow;
                ctx.shadowOffsetY = shadow;
            }
            ctx.fill();
            if (shadow != 0) {
                ctx.shadowColor = 'transparent';
            }
        }
    
        if (stroke) ctx.stroke();
    
        if (inset || recessed) {
            const w = width, h = height;
            const x = originX, y = originY;
            const insetWidth = 5;
            const light = `rgba(255,255,255,0.2)`;
            const dark = `rgba(0,0,0,0.4)`;
    
            const sides = [
                {
                    x: x, y: y, w: w, h: insetWidth,   // top
                    x1: x, y1: y, x2: x, y2: y + insetWidth,
                    color: inset ? light : dark
                },
                {
                    x: x, y: y, w: insetWidth, h: h,   // left
                    x1: x, y1: y, x2: x + insetWidth, y2: y,
                    color: inset ? light : dark
                },
                {
                    x: x, y: y + h - insetWidth, w: w, h: insetWidth, // bottom
                    x1: x, y1: y + h, x2: x, y2: y + h - insetWidth,
                    color: inset ? dark : light
                },
                {
                    x: x + w - insetWidth, y: y, w: insetWidth, h: h, // right
                    x1: x + w, y1: y, x2: x + w - insetWidth, y2: y,
                    color: inset ? dark : light
                }
            ];
    
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.clip();
    
            for (const side of sides) {
                const grad = ctx.createLinearGradient(side.x1, side.y1, side.x2, side.y2);
                grad.addColorStop(0, side.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(side.x, side.y, side.w, side.h);
            }
    
            ctx.restore();
        }
    }
    
    
    

    /**
     * 
     * Draws a line with rounded (circular) endcaps. Endcap extends past the 
     * start and end points by width. Line extends out from the start and end
     * points by width/2.
     * 
     * @param {context} ctx the context of the canvas to draw on
     * @param {int} originX the x coordinate of the middle of the start point
     * @param {int} originY the y coordinate of the middle of the start point
     * @param {int} end_x the x coordinate of the middle of the end point
     * @param {int} end_y the y coordinate of the middle of the end point
     * @param {int} width the width of the line
    */
   // Deprecated?
    static LineSegment(ctx, originX, originY, end_x, end_y, width, endpointSize){
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(end_x, end_y);
        ctx.lineWidth = width;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(originX,originY,endpointSize,0,2*Math.PI);
        ctx.fill();
 
        ctx.beginPath();
        ctx.arc(end_x,end_y,endpointSize,0,2*Math.PI);
        ctx.fill();
    }

    // Deprecated?
    // A line with rounded endpoints.
    static RoundedLine(ctx, originX, originY, end_x, end_y, width){
        this.LineSegment(ctx, originX, originY, end_x, end_y, width, width/2)
    }

    /**
     * A filled in circle.
     */
    static Circle({
        ctx, centerX, centerY, radius = 10,
        inset = false, recessed = false, shadow = false
    }) {
        if (shadow) {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
        }
    
        // Base fill
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
    
        if (shadow) ctx.restore();
    
        if (inset || recessed) {
            const light = 'rgba(255,255,255,0.3)';
            const dark = 'rgba(0,0,0,0.3)';
            const offset = radius * 0.4;
            const innerR = radius * 0.3;
            const outerR = radius * 1.5;
    
            const highlightPos = recessed
                ? [centerX + offset, centerY + offset]
                : [centerX - offset, centerY - offset];
            const shadowPos = recessed
                ? [centerX - offset, centerY - offset]
                : [centerX + offset, centerY + offset];
    
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.clip();
    
            // Shadow gradient
            const gDark = ctx.createRadialGradient(
                shadowPos[0], shadowPos[1], innerR,
                centerX, centerY, outerR
            );
            gDark.addColorStop(0, dark);
            gDark.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gDark;
            ctx.fillRect(centerX - radius, centerY - radius, 2 * radius, 2 * radius);
    
            // Highlight gradient
            const gLight = ctx.createRadialGradient(
                highlightPos[0], highlightPos[1], innerR,
                centerX, centerY, outerR
            );
            gLight.addColorStop(0, light);
            gLight.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gLight;
            ctx.fillRect(centerX - radius, centerY - radius, 2 * radius, 2 * radius);
    
            ctx.restore();
        }
    }
    
    

    static Arrow(ctx, originX, originY, end_x, end_y, scale){
        ctx.save()
        ctx.translate(end_x,end_y)
        const w = 0.3
        ctx.scale(scale/w,scale/w)
        ctx.rotate(Math.atan2(end_y-originY,end_x-originX))
        ctx.translate(-0.5,0)
        //this.RoundedLine(ctx,0,0,      1,0, w)
        this.RoundedLine(ctx,1,0,      0.5,-0.5, w)
        this.RoundedLine(ctx,0.5,-0.5, 0.5,0.5, w)
        this.RoundedLine(ctx,0.5,0.5,  1,0, w)
        ctx.beginPath();
        ctx.moveTo(1,0)
        ctx.lineTo(0.5,-0.5);
        ctx.lineTo(0.5,0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore()
    }


}