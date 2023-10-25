

function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');

  // -------------------------- UI -------------------------------------- 
  {
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
  }
  // ---------------------- END UI ------------------------------

  // ---------------------- LOAD OBJ -----------------------------
  {
  // Create a new XMLHttpRequest object
  var xhr = new XMLHttpRequest();

  // Configure it to request the OBJ file
  xhr.open('GET', 'teapot.obj', true);

  // Set the responseType to text
  xhr.responseType = 'text';

  // When the request completes, handle the content
  xhr.onload = function() {
      if (xhr.status === 200) {
          // The content of the OBJ file is in xhr.responseText
          var objFileContent = xhr.responseText;
          
          // Call the function to parse the OBJ file content
          var { vertices, faces } = parseOBJFile(objFileContent);
          
          // Now you can work with the parsed vertices and faces data
          console.log('Vertices:', vertices);
          console.log('Faces:', faces);
      } else {
          console.error('Failed to load OBJ file');
      }
  };

  // Send the request
  xhr.send();



  function parse_obj_file(objFileContent) {
    const vertices = [];
    const faces = [];

    const lines = objFileContent.trim().split('\n');
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const type = parts.shift();

        if (type === 'v') {
            // Parse vertex data
            const vertex = parts.map(parseFloat);
            vertices.push(vertex);
        } else if (type === 'f') {
            // Parse face data
            const face = parts.map(point => {
                const [vertexIndex] = point.split('/').map(parseInt);
                return vertexIndex;
            });
            faces.push(face);
        }
    }

    return { vertices, faces };
  }


  }
  // ------------------- END LOAD OBJ --------------------------------

  // --------------------------- DRAW ----------------------------------
  function draw() {

    var context = canvas.getContext('2d');
    canvas.width = canvas.width;


    context.strokeRect(0,0,canvas.width,canvas.height);

    

    // make image buffer
    // do projection
    // 
    
    // projection
    
    // verts = [vec3.fromValues(0,0,0),vec3.fromValues(0,1,0),vec3.fromValues(0,0,1)]
    // faces = [[0,1,2]]

    // camera_pos = vec3.fromValues(0,0,10);
    // camera_up = vec3.fromValues(1,0,0);
    // camera_right = vec3.fromValues(0,1,0);
    // camera_forward = vec3.create()
    // vec3.cross(camera_forward, camera_up, camera_right); // how to make right handed?, also normalize
    // how to rotate and translate camera, with sliders

    function worldToCamera(p){

    }
    // perspective divide

    // for each vert, transform vert

    //

  }
  // ------------------------- END DRAW --------------------------------
  draw();
}
// ---------------------- END SETUP ---------------------------
window.onload = setup;

