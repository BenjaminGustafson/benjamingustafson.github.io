

function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');


  // Input sliders
  const X = 0;
  const Y = 1;
  const Z = 2;
  const C = 3;
  var data = [1,1,1, 10]
  const sliderNames = ["x", "y", "z", "c"]
  const sliderBounds = [[-10,10], [-10,10], [-10,10], [0,20]]
  const sliderSteps = [0.1,0.1, 0.1,0.1]

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
  var outNames = ["x'", "y'", "z'"]
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

    const x = data[X]
    const y = data[Y]
    const z = data[Z]
    const c = data[C]


    context.beginPath();

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

