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