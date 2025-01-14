

function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');


  // Input sliders
  const X0 = 0;
  const Y0 = 1;
  const X1 = 2;
  const Y1 = 3;
  const X2 = 4;
  const Y2 = 5;
  const PX = 6;
  const PY = 7;
  var data = [20,580, 300,20, 580,580, 300,300]
  const sliderNames = ["x0", "y0", "x1", "y1", "x2", "y2", "px", "py"]
  const sliderBounds = [[0,canvas.width], [0,canvas.height], [0,canvas.width], [0,canvas.height], [0,canvas.width], [0,canvas.height], [0,canvas.width],[0,canvas.height]]
  const sliderSteps = [1,1, 1,1, 1,1, 1,1]

  var sliders = [];
  var sliderValues = [];
  var sliderDiv = document.getElementById('sliders');
  for (let i = 0; i < data.length; i++){
    // The container
    const div = document.createElement('div');
    div.class = 'slider-container';
    sliderDiv.appendChild(div);

    // The label
    var newLabel = document.createElement('label');
    newLabel.class = 'slider-label';
    newLabel.textContent = sliderNames[i];
    div.appendChild(newLabel);
    
    // The slider
    const newSlider = document.createElement('input');
    newSlider.type = 'range';
    newSlider.min =  sliderBounds[i][0];
    newSlider.max =  sliderBounds[i][1];
    newSlider.step = sliderSteps[i];
    newSlider.style = 'width : 200px, float:left';
    newSlider.value = data[i];
    newSlider.addEventListener('input', setValuesToSliders);
    sliders.push(newSlider);
    div.appendChild(newSlider);
    
    // The span
    var newSpan = document.createElement('span');
    newSpan.innerHTML = newSlider.value;
    div.appendChild(newSpan);
    sliderValues.push(newSpan);
  }

  function setValuesToSliders(){
    for(let i = 0; i < data.length; i++){
      data[i] = sliders[i].value * 1.0;// *1.0! thanks javascript :)
      sliderValues[i].innerHTML = `${data[i]}`;
    }
    draw();
  }

  function setSlidersToValues(){
    for(let i = 0; i < data.length; i++){
      sliders[i].value = data[i];
      sliderValues[i].innerHTML = `${data[i]}`;
    }
  }

  //Output divs
  var outputDiv = document.getElementById('outputs');
  var outNames = ["u 0", "u 1", "u 2"]
  var outValues = []
  for (let i = 0; i < outNames.length; i++){
     // The container
     const div = document.createElement('div');
     div.class = 'slider-container';
     outputDiv.appendChild(div);
    // Label
    var newLabel = document.createElement('label');
    newLabel.class = 'slider-label';
    newLabel.textContent = outNames[i] + " = ";
    div.appendChild(newLabel);
    
    // Value
    var newSpan = document.createElement('span');
    div.appendChild(newSpan);
    outValues.push(newSpan);
  }

  function draw() {

    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    context.strokeRect(0,0,canvas.width,canvas.height);

    const x0 = data[X0]
    const y0 = data[Y0]
    const x1 = data[X1]
    const y1 = data[Y1]
    const x2 = data[X2]
    const y2 = data[Y2]
    const px = data[PX]
    const py = data[PY]

    context.beginPath();
    context.strokeStyle = 'black';
    context.lineTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.closePath();
    context.stroke();
    
    context.beginPath();
    context.arc(px, py, 5, 0, 2 * Math.PI);
    context.fill(); 

    // Algorithm
    const u = [x2 - x0, x1 - x0, x0 - px]
    const v = [y2 - y0, y1 - y0, y0 - py]
    const w = [u[1]*v[2] - v[1]*u[2], -u[0]*v[2]+v[0]*u[2], u[0]*v[1]-v[0]*u[1]] // u x v
    if (Math.abs(w[2]) < 1){
      outValues[0].innerHTML = "undefined"
      outValues[1].innerHTML = "undefined"
      outValues[2].innerHTML = "undefined"
    }else{
      const r0 =  1 - (w[0] + w[1])/w[2]
      const r1 = w[0]/w[2]
      const r2 = w[1]/w[2]
      outValues[0].innerHTML = `${r0.toFixed(2)}`
      outValues[1].innerHTML = `${r1.toFixed(2)}`
      outValues[2].innerHTML = `${r2.toFixed(2)}`
    }


  }
  draw();
}
window.onload = setup;

