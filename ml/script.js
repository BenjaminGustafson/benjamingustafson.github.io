
function main() { "use strict";
  var canvas = document.getElementById('myCanvas');

  {// -------------------------- UI -------------------------------------- 

  // Input sliders
  var data = [0.2,0.2,0.2,0.2,0.2]
  const sliderNames = ['p1','p2','p3','p4','p5']
  const sliderBounds = [[0,100],[0,100],[0,100],[0,100],[0,100]]
  const sliderSteps = [1,1,1,1,1]

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
    var sum = 0;
    for (let i = 0; i < sliders.length; i++){
      sum += sliders[i].value*1.0;
    }
    if (sum > 100){
      setSlidersToValues();
      return;  
    }else if (sum < 100){
      (let i = 0; i < sliders.length; i++){
        sliders[i].value += (1.0-sum)/5.0;
      }
    }
    for(let i = 0; i < data.length; i++){
      data[i] = sliders[i].value * 1;// *1.0! thanks javascript :)
      sliderValues[i].innerHTML = `${data[i].toFixed(2)}`;
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
  var outNames = []
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
  }// ---------------------- END UI ------------------------------


  // --------------------------- DRAW ----------------------------------
  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;
    context.strokeRect(0,0,canvas.width,canvas.height);



    for (let i = 0; i < 1000; i++){
      const r = Math.random();


    }
    

  }
  // ------------------------- END DRAW --------------------------------

  draw();
}
window.onload = main;

