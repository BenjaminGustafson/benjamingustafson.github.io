
function main() { "use strict";
  var canvas = document.getElementById('myCanvas');
  var verts = [];
  var faces = [];
  var image = [];

  {// -------------------------- UI -------------------------------------- 
  const CAM_X = 0;
  const CAM_Y = 1;
  const CAM_Z = 2;
  const UP_X = 3; // switch to pitch/yaw/roll
  const UP_Y = 4;
  const UP_Z = 5;
  const RIGHT_X = 6;
  const RIGHT_Y = 7;
  const RIGHT_Z = 8;
  // Input sliders
  var data = [0,0,-5, 0,0,1, 1,0,0]
  const sliderNames = ["cam_x", "cam_y", "cam_z", "up_x", "up_y", "up_z", "right_x", "right_y", "right_z"]
  const sliderBounds = [[-10,10], [-10,10], [-10,10], [-1,1],[-1,1],[-1,1], [-1,1],[-1,1],[-1,1],  ]
  const sliderSteps = [.1,.1,.1, .01,.01,.01, .01,.01,.01,]

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


  {// ---------------------- LOAD OBJ -----------------------------
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

    return {'vertices': vertices, faces };
  }

  fetch('https://benjamingustafson.github.io/renderer/obj/teapot.obj')
  .then(response => response.text())
  .then(data => {
    const parsedData = parse_obj_file(data);
    verts = parsedData.vertices
    faces = parsedData.faces
    draw();
  })
  .catch(error => {
    console.error('Error:', error);
  });

  }// ------------------- END LOAD OBJ --------------------------------

  {// ----------------------- SETUP IMAGE BUFFER ----------------------------
 
  for (let y = 0; y < canvas.height; y++){
    var row = [];
    for (let x = 0; x < canvas.width; x++){
      row.push([x/canvas.width,0.0,0.0]);
    }
    image.push(row);
  }
  }// ----------------------- END SETUP IMAGE BUFFER ------------------------

  // --------------------------- DRAW ----------------------------------
  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;
    context.strokeRect(0,0,canvas.width,canvas.height);
    
    // projection
    var cam_pos = vec3.fromValues(data[CAM_X],data[CAM_Y],data[CAM_Z]);
    var cam_up = vec3.fromValues(data[UP_X],data[UP_Y],data[UP_Z]);
    var cam_right = vec3.fromValues(data[RIGHT_X],data[RIGHT_Y],data[RIGHT_Z]);

    var cam_forward = vec3.create()
    vec3.cross(cam_forward, cam_right, cam_up);
    
    var lookAt = mat4.create();
    mat4.lookAt(lookAt, cam_pos, vec3.create(), cam_up);

    // perspective
    var perspective = mat4.create();
    mat4.perspective(perspective, 0.5, 1, 1,100);

    // for each vert, transform vert
    var pixel_coords = []
    for (let i = 0; i < verts.length; i++){
      const vert = verts[i];
      var new_p = vec4.fromValues(vert[0], vert[1], vert[2], 1);
      vec4.transformMat4(new_p, new_p, lookAt);
      vec4.transformMat4(new_p, new_p, perspective);
      // clipping should occur here
      pixel_coords.push(new_p);
    }

    // Initialize Z-buffer
    z_buffer = []
    for (let y = 0; y < canvas.height; y++){
      var row = [];
      for (let x = 0; x < canvas.width; x++){
        row.push(Infinity);
      }
      z_buffer.push(row);
    }

    // For each face, compute triangle and draw
    for (let i = 0; i < faces.length; i++){
      // get pixel coords of vertices
      //tri = [pixelcoords[faces[i][0]], pixelcoords[faces[i][1]], pixelcoords[faces[i][2]]]
      // bounding box
      // for each pixel in bounding box
        // use barycentric coords to get z coord, and pass to shader??
        // update zbuffer
    }

    


    // Image buffer

    function clamp(input, min, max){
      if (input < min){
        input = min;
      }else if(input > max){
        input = max;
      }
      return input;
    }
    
    function draw_image_buffer(buffer){
      for (let y = 0; y < buffer.length; y++){
        for (let x = 0; x < buffer[y].length; x++){
          const r = clamp(Math.round(buffer[y][x][0]*255),0,255);
          const g = clamp(Math.round(buffer[y][x][1]*255),0,255);
          const b = clamp(Math.round(buffer[y][x][2]*255),0,255);
          // var id = context.createImageData(1,1);
          // var d = id.data;
          // d[0] = 255;
          // d[1] = 0;
          // d[2] = 0;
          // context.putImageData(id,x,y);
          context.fillStyle = `rgb(${r},${g},${b})`;
          context.fillRect(x,y,1,1);
        }
      }
    }

    draw_image_buffer(image);
  }
  // ------------------------- END DRAW --------------------------------

}
window.onload = main;

