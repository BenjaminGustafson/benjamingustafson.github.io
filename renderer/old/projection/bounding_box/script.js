

function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');

  const X0 = 0;
  const Y0 = 1;
  const X1 = 2;
  const Y1 = 3;
  const X2 = 4;
  const Y2 = 5;
  // Input sliders
  var data = [20,580, 300,20, 580,580]
  const sliderNames = ["x0", "y0", "x1", "y1", "x2", "y2"]
  const sliderBounds = [[0,canvas.width], [0,canvas.height], [0,canvas.width], [0,canvas.height], [0,canvas.width], [0,canvas.height], ]
  const sliderSteps = [1,1, 1,1, 1,1,]

  var sliders = [];
  var sliderValues = [];
  var sliderDiv = document.getElementById('sliders');
  for (let i = 0; i < data.length; i++){
    // The container
    const div = document.createElement('div');
    div.class = 'slider-container';
    div.style = "display: flex; align-items: center;"
    sliderDiv.appendChild(div);

    // The label
    var newLabel = document.createElement('label');
    newLabel.style = "min-width: 100px; text-align: left;";
    newLabel.textContent = sliderNames[i];
    div.appendChild(newLabel);
    
    // The slider
    const newSlider = document.createElement('input');
    newSlider.type = 'range';
    newSlider.min =  sliderBounds[i][0];
    newSlider.max =  sliderBounds[i][1];
    newSlider.step = sliderSteps[i];
    newSlider.style = "width: 200px;";
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
  var outNames = ["bb_min_x", "bb_min_y", "bb_max_x", "bb_max_y"]
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

    context.beginPath();
    context.strokeStyle = 'black';
    context.lineTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.closePath();
    context.stroke();

    const NINFTY = -1000000;
    const INFTY  =  1000000;
    var bbminx = INFTY;
    var bbminy = INFTY;
    var bbmaxx = NINFTY;
    var bbmaxy = NINFTY;
    for (let i = 0; i < 3; ++i) { 
      if (data[i*2] < bbminx) bbminx = data[i*2];
      if (data[i*2] > bbmaxx) bbmaxx = data[i*2];
      if (data[i*2+1] < bbminy) bbminy = data[i*2+1];
      if (data[i*2+1] > bbmaxy) bbmaxy = data[i*2+1];
    }

    context.strokeStyle = 'red';
    context.strokeRect(bbminx, bbminy, bbmaxx- bbminx, bbmaxy-bbminy);

    outValues[0].innerHTML = `${bbminx}`
    outValues[1].innerHTML = `${bbminy}`
    outValues[2].innerHTML = `${bbmaxx}`
    outValues[3].innerHTML = `${bbmaxy}`

  }
  draw();
}
window.onload = setup;

