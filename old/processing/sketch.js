var margin = 50;
var y_drag;
var x_drag;

function setup(){
    createCanvas(600,600);
    y_drag = new DragCircle(margin,margin,20,'x',margin,height-margin, (50), (0));
    x_drag = new DragCircle(width-margin,height-margin,20,'y',margin,width-margin, (50), (0));
}

// tape moves or head moves
// text fields or drop downs
// text fields that don't accept wrong symbols
// arrow keys to move text field focus, tab
// run, step, undo, run at full speed

function draw(){
    background(250);
    fill(255);
    stroke(50);
    strokeWeight(5);
    beginShape();
    vertex(margin,y_drag.y);
    vertex(margin,height-margin);
    vertex(x_drag.x,height-margin);
    endShape(CLOSE);
    text("a = " + (height - y_drag.y-margin),width - margin,margin);
    text("b = " + (x_drag.x-margin),width - margin,margin + 10);
    y_drag.display(); 
    x_drag.display();
}

