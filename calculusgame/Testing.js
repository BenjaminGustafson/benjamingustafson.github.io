
function setup() { "use strict";

  var canvas = document.getElementById('myCanvas');
  var objects = []
  
  var topGrab = {priority:-1, obj:null};

  canvas.addEventListener('mousedown', function (event) {
    var rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    objects.forEach(obj => obj.mouseDown(x,y,topGrab))
    if (topGrab.obj){
      console.log(`grabbed ${topGrab.obj.token} ${topGrab.priority}`)
      topGrab.obj.grabbed = true
    }
    
  });

  canvas.addEventListener('mousemove', function (event) {
    var rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    objects.forEach(obj => obj.mouseMove(x,y))
  });

  canvas.addEventListener('mouseup', function (event) {
    var rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    objects.forEach(obj => obj.mouseUp(x,y))
    if (topGrab.obj){
      topGrab.obj.grabbed = false
      console.log(`let go ${topGrab.obj}`)
      topGrab = {priority:-1, obj:null};
    }
  });

  function draw() {

    var ctx = canvas.getContext('2d');
    canvas.width = canvas.width;

    //Background
    Color.setColor(ctx,Color.black)
    ctx.fillRect(0,0,canvas.width,canvas.height);

    Color.setColor(ctx,Color.white)
    Shapes.Grid(ctx, 100,100, 300,300, 4, 10)
    Shapes.VerticalSlider(ctx, 500,100, 300, 6,3, 10)

    for (let i = 0; i < objects.length; i++){
      objects[i].draw(ctx);
    }

    window.requestAnimationFrame(draw); 
  }
  draw();
  console.log(objects)
}
window.onload = setup;
