// ----------------------- Setup ---------------------------------
function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');


  // --------------------- Draw -----------------------------------
  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;


    
    window.requestAnimationFrame(draw);
  }
  // --------------------- End Draw ----------------------

  window.requestAnimationFrame(draw);
}
// --------------------- End Setup ----------------------
window.onload = setup;
    