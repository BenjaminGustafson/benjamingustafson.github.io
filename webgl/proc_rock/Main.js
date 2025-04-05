"use strict";

// ------------------------------- Global Vars ---------------------------------------------
var gl = null;
var fullscreenProgram = null;
var vao = null;
var uvScale = 5.0;
let gl2;

let sphereProgram;
let vao2;
let sphereGeometry;
let projectionMatrix;
let sphere;

// Global object for uniform values
const uniforms = [
    ["u_uvScale", 5.0, "1f",0,20],
    ["u_roughness", 0.7, "1f",0,1],
    ["u_metalness", 0.0, "1f",0,1],
    ["u_lightIntensity", 5, "1f",0,20],
    ["u_ambientLight", 0.3, "1f",0,1],
    ["u_bumpStrength",0.3, "1f", 0, 1],
    ["u_bumpNoiseScale",5.0, "1f", 0, 20]
]
  


// ------------------------------- Setup  ---------------------------------------------
function setup() {
    // ---------------------------------- Sphere ----------------------------------------------
    sphereGeometry = generateIcosphere(1,4)

    var canvas2 = document.querySelector("#canvas");
    gl2 = canvas2.getContext("webgl2");
    if (!gl2) {
        console.error("WebGL2 not available");
        return;
    }
    resizeCanvasToDisplaySize(gl2.canvas);

    gl2.enable(gl2.DEPTH_TEST);
    gl2.depthFunc(gl2.LEQUAL);

    sphereProgram = createProgram(
        gl2,
        createShader(gl2, gl2.VERTEX_SHADER, rockBumpVertSrc),
        createShader(gl2, gl2.FRAGMENT_SHADER, rockFullFragSrc)
    );

    sphere = new SceneObject(gl2, sphereProgram, sphereGeometry);

    vao2 = gl2.createVertexArray();
    gl2.bindVertexArray(vao2);


    var fieldOfView = 45 * Math.PI / 180;
    var aspect = gl2.canvas.clientWidth / gl2.canvas.clientHeight;
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100.0);


    // --------------------------------- Flat --------------------------------------------------- 

    var canvas = document.querySelector("#canvas2");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 not available");
        return;
    }
    resizeCanvasToDisplaySize(gl.canvas);


    fullscreenProgram = createProgram(
        gl,
        createShader(gl, gl.VERTEX_SHADER, fullscreenVertSrc),
        createShader(gl, gl.FRAGMENT_SHADER, rockFragSrc)
    );


    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);



    // ------------------------- Uniform sliders --------------------------
    const controlsDiv = document.getElementById("controls");
    for (let i = 0; i < uniforms.length; i++){
        controlsDiv.append(createSliderControl(uniforms[i]));
    }
    
}

function createSliderControl(uniformArray) {
    const name = uniformArray[0]
    const min = uniformArray[3]
    const max = uniformArray[4]
    const step = (max - min)/100.0
    const initialValue = uniformArray[1]
    // Create a container div.
    const container = document.createElement("div");

    // Create a label.
    const label = document.createElement("label");
    label.htmlFor = name;
    label.textContent = name.substring(2);
    container.appendChild(label);

    // Create the slider input.
    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = name;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = initialValue;
    container.appendChild(slider);

    // Create a span to display the current value.
    const span = document.createElement("span");
    span.id = name + "Value";
    span.textContent = initialValue;
    container.appendChild(span);

    slider.addEventListener("input", function() {
        const value = parseFloat(slider.value);
        uniformArray[1] = value;
        span.textContent = slider.value;
    });
    return container;
}

// ------------------------------- Render ---------------------------------------------
function render(time) {
    time *= 0.001;
    
    // ------------------------------ Flat ---------------------------------------------- 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(fullscreenProgram);

    for (let i = 0; i <  uniforms.length; i++) {
        let uniform = uniforms[i]
        setUniform(gl, fullscreenProgram, uniform[0], uniform[1], uniform[2])
    }

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    

    // -------------------------------- Sphere -------------------------------------------
    gl2.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl2.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl2.bindVertexArray(vao2);
    // Create model-view matrix
    var cameraPosition = [0,0,3]
    gl2.useProgram(sphereProgram);
    setUniform(gl2, sphereProgram, "u_cameraPos", cameraPosition, "3fv")
    var target = [0, 0, 0]
    var up = [0, 1, 0]
    var viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, cameraPosition, target, up)

    mat4.identity(sphere.modelMatrix); 
    mat4.rotateY(sphere.modelMatrix, sphere.modelMatrix, time*0.1)

    const vpMatrix = mat4.create()
    mat4.multiply(vpMatrix, projectionMatrix, viewMatrix);

    sphere.draw(vpMatrix, uniforms)

    // ------------------------------------------------------------------------------------
    requestAnimationFrame(render);
}// End render


// -------------------------------- Start the App ---------------------------------------------
setup();
requestAnimationFrame(render);



function setUniform(gl, program, name, value, type) {
    const loc = gl.getUniformLocation(program, name);
    if (loc === null) return;

    switch (type) {
        case '1f': gl.uniform1f(loc, value); break;
        case '1i': gl.uniform1i(loc, value); break;
        case '2f': gl.uniform2f(loc, value[0], value[1]); break;
        case '2fv': gl.uniform2fv(loc, value); break;
        case '3f': gl.uniform3f(loc, value[0], value[1], value[2]); break;
        case '3fv': gl.uniform3fv(loc, value); break;
        case '4f': gl.uniform4f(loc, value[0], value[1], value[2], value[3]); break;
        case '4fv': gl.uniform4fv(loc, value); break;
        case 'mat3': gl.uniformMatrix3fv(loc, false, value); break;
        case 'mat4': gl.uniformMatrix4fv(loc, false, value); break;
        case 'tex2d':
            gl.activeTexture(gl.TEXTURE0 + value.unit);
            gl.bindTexture(gl.TEXTURE_2D, value.texture);
            gl.uniform1i(loc, value.unit);
            break;
        default:
            console.warn(`Unknown uniform type "${type}" for ${name}`);
    }
}