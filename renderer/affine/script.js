

function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');


  // Input sliders
  var data = [1,0,0,0,1,0];
  const sliderNames = ["x scale", "x skew", "x translate", "y skew", "y scale", "y translate"];
  const sliderBounds = [[-5,5],[-10,10],[-500,500], [-10,10],[-5,5],[-500,500],];
  const sliderSteps = [0.01,0.01,1, 0.1,0.1,0.1,];

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

    // for (let i = 0; i < canvas.width; i++){
    //   for (let j = 0; j < canvas.width; j++){
    //     context.fillStyle = `rgb(${i},${j},0)`
    //     context.fillRect(i,j,1,1);
    //   }
    // }
    for (let i = 0; i < canvas.width; i+=10){
        context.beginPath();
        context.moveTo(0,i);
        context.lineTo(canvas.width,i);
        context.stroke();
        context.font = "50px sans-serif";
        context.fillText("Hello world", 50, 90);
    }


  }
  draw();
}
window.onload = setup;

