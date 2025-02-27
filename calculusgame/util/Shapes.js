
/**
 * Extra drawing methods for commonly used shapes.
 */
class Shapes {
    
    /**
     * TODO: Could you not just use the built in endCap? There's no arrow option, so whats 
     * the best way to handle that?
     * 
     * @param {context} ctx the context of the canvas to draw on
     * @param {int} start_x the x coordinate of the middle of the start point
     * @param {int} start_y the y coordinate of the middle of the start point
     * @param {int} end_x the x coordinate of the middle of the end point
     * @param {int} end_y the y coordinate of the middle of the end point
     * @param {int} width the width of the line
    */
    static Line(ctx, start_x, start_y, end_x, end_y, width, endCapStyle="rounded", endCapSize=-1){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(end_x, end_y);
        ctx.lineWidth = width;
        ctx.stroke();
        
        if (endCapSize == -1){
            endCapSize = width
        }

        switch (endCapStyle){
            case "rounded":
                ctx.beginPath();
                ctx.arc(start_x,start_y,width/2,0,2*Math.PI);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(end_x,end_y,width/2,0,2*Math.PI);
                ctx.fill();
                break;
            case "arrow":
                this.Arrow(ctx, start_x, start_y, end_x, end_y,endCapSize)
                this.Arrow(ctx, end_x, end_y, start_x, start_y,endCapSize)
                break;
            default:
                break;    
        }

        
    }

    static Rectangle(ctx,start_x,start_y,width,height,strokeWidth,fill=false){
        this.Line(ctx, start_x, start_y, start_x+width, start_y,strokeWidth)
        this.Line(ctx, start_x, start_y, start_x, start_y+height,strokeWidth)
        this.Line(ctx, start_x+width, start_y, start_x+width, start_y+height,strokeWidth)
        this.Line(ctx, start_x, start_y+height, start_x+width, start_y+height,strokeWidth)
        if (fill){
            ctx.fillRect(start_x,start_y,width,height)
        }
    }

    static Function(ctx, f, start_x, start_y, width, height, x_min, x_max, y_min, y_max, lineWidth, endCapStyle){
        
    }


    /**
     * 
     * Draws a line with rounded (circular) endcaps. Endcap extends past the 
     * start and end points by width. Line extends out from the start and end
     * points by width/2.
     * 
     * @param {context} ctx the context of the canvas to draw on
     * @param {int} start_x the x coordinate of the middle of the start point
     * @param {int} start_y the y coordinate of the middle of the start point
     * @param {int} end_x the x coordinate of the middle of the end point
     * @param {int} end_y the y coordinate of the middle of the end point
     * @param {int} width the width of the line
    */
    static LineSegment(ctx, start_x, start_y, end_x, end_y, width, endpointSize){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(end_x, end_y);
        ctx.lineWidth = width;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(start_x,start_y,endpointSize,0,2*Math.PI);
        ctx.fill();
 
        ctx.beginPath();
        ctx.arc(end_x,end_y,endpointSize,0,2*Math.PI);
        ctx.fill();
    }

    // A line with rounded endpoints.
    static RoundedLine(ctx, start_x, start_y, end_x, end_y, width){
        this.LineSegment(ctx, start_x, start_y, end_x, end_y, width, width/2)
    }

    static Circle(ctx, center_x, center_y, radius){ 
        ctx.beginPath();
        ctx.arc(center_x,center_y,radius,0,2*Math.PI);
        ctx.fill();
    }

    // A an arrow shape
    static Arrow(ctx, start_x, start_y, end_x, end_y, scale){
        ctx.save()
        ctx.translate(end_x,end_y)
        const w = 0.3
        ctx.scale(scale/w,scale/w)
        ctx.rotate(Math.atan2(end_y-start_y,end_x-start_x))
        this.RoundedLine(ctx,0,0,      1,0, w)
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