class DragCircle {
    x; y; r;
    regular; highlight;
    fix_axis;
    min; max;
    offX = 0; offY = 0;
    dragging = false;
    hovering = false;
    firstPress = false;
    isPressed = false;
    
    constructor(x, y, r, fix_axis, min, max, regular = (50), highlight = (0)) {
        this.x = x; this.y = y; this.r = r;
        this.fix_axis = fix_axis;
        this.min = min;
        this.max = max;
        this.regular = regular;
        this.highlight = highlight;
    }
    
    display() {
      //If the mouse is not pressed, stop dragging
      if(!mouseIsPressed) {
        this.dragging = false;
        this.firstPress = false;
        this.isPressed = false;
      }
      //If this is the first time the mouse has been pressed, mark
      //the firstPress event
      else {
        if(this.isPressed) {
          this.firstPress = false;
        } else {
          this.firstPress = true;
          this.isPressed = true;
        }
      }
      
      //If the item was already being dragged
      if(this.dragging) {
        if(this.fix_axis != 'x')
          this.x = mouseX + this.offX;
        if(this.x > this.max)
          this.x = this.max;
        if(this.x < this.min)
          this.x = this.min;
          
        if(this.fix_axis != 'y')
          this.y = mouseY + this.offY;
        if(this.y > this.max)
          this.y = this.max;
        if(this.y < this.min)
          this.y = this.min;
      } else { //Otherwise, item not already being dragged...
        //So, if the mouse is now over the item...
        //We used the dist() function in class, this way is faster because
        //it doesn't involve taking a square root, which is a pretty slow operation
         this.diffX = this.x-mouseX;
         this.diffY = this.y-mouseY;
        if(this.diffX*this.diffX+this.diffY*this.diffY < this.r*this.r/4) {
          //If this is the first press of the mouse, then start dragging
          if(this.firstPress) {
            this.dragging = true;
            this.offX = this.x-mouseX;
            this.offY = this.y-mouseY;
          } else { //otherwise, this is just a hover
            this.hovering = true;
          }
        }
        else { //If the mouse is not over the item, then don't hover
          this.hovering = false;
        }
      }
      //Now, actually draw the circle
      noStroke();
      if(this.dragging || this.hovering) fill(this.highlight);
      else fill(this.regular);
      ellipse(this.x,this.y,this.r,this.r);
    }
  }