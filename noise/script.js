// ----------------------- Setup ---------------------------------
function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');


  // --------------------- Draw -----------------------------------
  function draw() {
    var ctx = canvas.getContext('2d');
    canvas.width = canvas.width;

    ctx.strokeRect(0,0,canvas.width,canvas.height)

    for (let x = 0; x < canvas.width; x++){
      for (let y = 0; y < canvas.height; y++){
        const v = (Noise2D(x*.01,y*.01)*0.5+0.5)*255;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x,y,1,1);
      }
    }

  }
  // --------------------- End Draw ----------------------
  draw();
}
// --------------------- End Setup ----------------------
window.onload = setup;
    