
function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');
    
  const testString = "a + b + c +  e + F"
  console.log((SyntaxTree.tokenize(testString)))
  console.log((SyntaxTree.parse(testString).toExpression()))
  console.log(MathBlock.fromSyntaxTree(SyntaxTree.parse("(a + b) + (c + (d + e))")))
  
  const block1 = MathBlock.fromSyntaxTree(SyntaxTree.parse("(a + b) + (c + (d + e))"))
  var objects = [block1]
  
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

    ctx.strokeRect(0,0,canvas.width,canvas.height);
    

    for (let i = 0; i < objects.length; i++){
      objects[i].draw(ctx);
    }

    window.requestAnimationFrame(draw); 
  }
  draw();
  console.log(objects)
}
window.onload = setup;

