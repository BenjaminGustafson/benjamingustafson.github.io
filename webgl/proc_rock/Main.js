"use strict";

// ------------------------------- Global Vars ---------------------------------------------
var gl = null;
var gradientProgram = null;
var vao = null;

// ------------------------------- Setup Function ---------------------------------------------
function setup() {
    var canvas = document.querySelector("#canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 not available");
        return;
    }
    resizeCanvasToDisplaySize(gl.canvas);

    gradientProgram = createProgram(
        gl,
        createShader(gl, gl.VERTEX_SHADER, fullscreenVertSrc),
        createShader(gl, gl.FRAGMENT_SHADER, fullscreenFragSrc)
    );

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.clearColor(0, 0, 0, 1);
}

// ------------------------------- Render Loop ---------------------------------------------
function render(time) {
    time *= 0.001;
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(gradientProgram);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}

// -------------------------------- Start the App ---------------------------------------------
setup();
requestAnimationFrame(render);
