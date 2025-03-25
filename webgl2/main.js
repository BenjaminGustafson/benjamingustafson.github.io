"use strict";

var vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

unifrom mat4 u_normalMatrix;
uniform mat4 u_matrix;

out vec3 v_normal;

void main() {
  gl_Position = u_matrix * a_position;
  v_normal = mat3(u_normalMatrix) * a_normal;
}
`;

var fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_normal;
out vec4 outColor;

uniform vec3 u_reverseLightDirection;

void main() {
  vec3 normal = normalize(v_normal);
  float light = max(dot(normal, u_reverseLightDirection), 0.0);
  vec3 baseColor = vec3(1.0, 0.0, 0.5);
  outColor = vec4(vaseColor * light, 1.0);
}
`;

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
  gl.deleteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
  gl.deleteProgram(program);
  return undefined;
}


// ------------------------ Geometry data --------------------------------
const vertices = [
  0,  0.5, 0,   // v0
 -0.5, -0.5, 0, // v1
  0.5, -0.5, 0, // v2
  0, -0.5, -0.5 // v3
];

const indices = [
 0, 1, 2,
 1, 2, 3
];

const normals = [
  0,  0, 1,  // normal for v0
  0,  0, 1,  // v1
  0,  0, 1,  // v2
  0,  0, 1   // v3 (still flat-facing camera)
];


function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // -------------------------------- Create Shader Program --------------------------------
  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);


  // ------------------------------- Pass vertex data to shader ---------------------------
  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
  
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  // --------------------------- Canvas set up -----------------------------------------
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // ------------------------- Projection matrix -----------------------------------------
  var matrixLocation = gl.getUniformLocation(program, "u_matrix")
  var projectionMatrix = mat4.create()
  var fov = Math.PI / 3
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  var zNear = 0.1
  var zFar = 100
  mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar)

  // ------------------------------ Camera ---------------------------------------------
  var cameraPosition = [0,0,2]
  var target = [0,0,0]
  var up = [0,1,0]
  var viewMatrix = mat4.create()
  mat4.lookAt(viewMatrix, cameraPosition, target, up)

  var viewProjectionMatrix = mat4.create()
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix)
  gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrix)

  // --------------------------- Draw ----------------------------------------
  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

main();
