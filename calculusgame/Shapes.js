
/**
 * Extra drawing methods for commonly used shapes.
 */
class Shapes {
    
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



}