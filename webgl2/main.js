"use strict";




// ------------------------------- Global Vars ---------------------------------------------
var gl = null
var sceneObjects = []
var skyProgram = null
let reflectionFramebuffer;
let reflectionTexture;
var lake = null


// ================================ SETUP =================================================
function setup() {
  // Get A WebGL context
  var canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // ----------------------------- Create geometry ---------------------------------------
  const perlin = createPerlinNoise(44);
  const fbm = createFBM(perlin, { 
    octaves: 5,
    persistence: 0.4,
    lacunarity: 2.6,
    scale: 6,
    });

  const terrainGeometry = generateTerrain(20, 15, 200, fbm, {gradientScale: 0.1, gradientPower:1});

  const lakeGeometry = generateLake(20, 10, 200);

  const cubeGeometry = generateCube(1.0); // size 2
    const cubeModelMatrix = mat4.create();
    mat4.translate(cubeModelMatrix, cubeModelMatrix, [0, 1.5, 0]);

  // -------------------------------- Create Shader Programs --------------------------------
  // Mountains
  const mountainProgram = createProgram(gl,
    createShader(gl, gl.VERTEX_SHADER, generalVertexShaderSource), 
    createShader(gl, gl.FRAGMENT_SHADER, mountainFragmentShaderSource)
  );

  // Lake
  const lakeProgram = createProgram(gl,
    createShader(gl, gl.VERTEX_SHADER, lakeVertexShaderSource), 
    createShader(gl, gl.FRAGMENT_SHADER, lakeFragmentShaderSource)
  );

  // Sky
  skyProgram = createProgram(gl,
    createShader(gl, gl.VERTEX_SHADER, skyVertexShaderSource), 
    createShader(gl, gl.FRAGMENT_SHADER, skyFragmentShaderSource)
  );

  // ------------------------------- Create SceneObjects  ---------------------------
  var mountainModelMatrix = mat4.create();
  mat4.translate(mountainModelMatrix,mountainModelMatrix,[0,-1.5,-0.5])
  mat4.scale(mountainModelMatrix,mountainModelMatrix,[1,2,1])
  const terrain = new SceneObject(gl, mountainProgram, terrainGeometry,mountainModelMatrix);
  var lakeModelMatrix = mat4.create();
  mat4.translate(lakeModelMatrix,lakeModelMatrix,[0,0,0])
  lake = new SceneObject(gl, lakeProgram, lakeGeometry, lakeModelMatrix, {
    u_waterColor: [0.0, 0.3, 0.6],
    u_shininess: 16.0,
    u_specularStrength: 1.0,
  });
  
  //sceneObjects.push(terrain);
  sceneObjects.push(lake);
  const cube = new SceneObject(gl, mountainProgram, cubeGeometry, cubeModelMatrix);
  sceneObjects.push(cube);

  gl.enable(gl.DEPTH_TEST);

  // --------------------------------- Reflection ------------------------------------------
  // === Create Reflection Framebuffer ===
  reflectionFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFramebuffer);

  // Create the reflection texture
  reflectionTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    gl.canvas.width, gl.canvas.height,
    0, gl.RGBA, gl.UNSIGNED_BYTE, null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Attach the texture as the color attachment
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    reflectionTexture,
    0
  );

  // Create a depth renderbuffer
  const reflectionDepthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, reflectionDepthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    reflectionDepthBuffer
  );

  // Check completeness
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error("Reflection framebuffer is not complete");
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind for now


}// End Setup


// ================================ Render Loop ===============================================
var then = 0
function render(time) {
  time *= 0.001;  // convert to seconds
  const deltaTime = time - then;
  then = time;
  // -------------------------- Projection matrix -------------------------------
  var projectionMatrix = mat4.create()
  var fov = Math.PI / 3
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  var zNear = 0.1
  var zFar = 100
  mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar)

  // ------------------------------ View --------------------------------------
  var cameraPosition = [0,4.5,8]
  var target = [Math.sin(time)*2,Math.cos(time)*2,0]
  var up = [0,1,0]
  var viewMatrix = mat4.create()
  mat4.lookAt(viewMatrix, cameraPosition, target, up)

  // -------------------------- View + Projection -----------------------------
  const viewProjectionMatrix = mat4.create();
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);


  const invViewProj = mat4.create();
  mat4.invert(invViewProj, viewProjectionMatrix);

  
  // ----------------------------- Reflected view ------------------------------
  const reflectedCamera = cameraPosition.slice()
  reflectedCamera[1] *= -1
  const reflectedTarget = target.slice();
  reflectedTarget[1] *= -1;
  var reflectedViewMatrix = mat4.create()
  mat4.lookAt(reflectedViewMatrix, reflectedCamera, reflectedTarget, up)
  const reflectedVPMatrix = mat4.create();
  mat4.multiply(reflectedVPMatrix, projectionMatrix, reflectedViewMatrix);
  const invReflectedVP = mat4.create();
  mat4.invert(invReflectedVP, reflectedVPMatrix)

  // --------------------- Render to Reflection Texture -----------------------
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFramebuffer);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Reflected sky
  const skyVAO = gl.createVertexArray();
  gl.bindVertexArray(skyVAO);
  gl.depthMask(false); // Don’t write to depth buffer
  gl.useProgram(skyProgram);
  gl.uniformMatrix4fv(gl.getUniformLocation(skyProgram, "u_inverseViewProjection"), false, invReflectedVP);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.depthMask(true);  // Re-enable depth writing for scene

  //Render all non-water objects
  for (const obj of sceneObjects) {
    if (obj !== lake) {
      obj.draw(reflectedVPMatrix, {
        lightDir: vec3.normalize([], [1, 1, 1]),
        ambient: 0.2,
      }, {
        u_time: time,
        u_clipY: 0.0,
        u_clipping: false
      });
    }
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Done rendering reflection

  // --------------------------- Canvas set up -----------------------------------------
  resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // ------------------------------- Draw sky ----------------------------------------
  gl.bindVertexArray(skyVAO);
  gl.depthMask(false); // Don’t write to depth buffer
  gl.useProgram(skyProgram);
  gl.uniformMatrix4fv(gl.getUniformLocation(skyProgram, "u_inverseViewProjection"), false, invViewProj);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.depthMask(true);  // Re-enable depth writing for scene

   // -------------------------------- Draw --------------------------------------
   for (const obj of sceneObjects) {
    obj.draw(viewProjectionMatrix, {
      lightDir: vec3.normalize([], [1, 1, 1]),
      ambient: 0.2,
    }, {
      u_time: time,
      u_camera_position: cameraPosition,
      u_clipping: false,
      u_reflectedVP: reflectedVPMatrix,
    });
  }

  requestAnimationFrame(render);
}

setup();
requestAnimationFrame(render);
