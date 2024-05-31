/**
 * To make an object we need to
 * - Get the vertex data for the object (attributes)
 * - Write the shaders for that object
 * - Pass the attributes to the shader
 * - Put all the stuff in a VAO
 * - Get the uniforms for the object
 * - Pass the uniforms to the shader
 * 
 * OO version:
 * 
 * shader class
 * - Does all the shader initialization
 * 
 * mesh class
 * - 
 * - 
 * - draw method
 * 
 * main draw method
 * 
 */

function init(){

    const canvas = document.getElementById("mycanvas");
    const gl = canvas.getContext('webgl2');

    const texShader = new Shader(gl, texVert, texFrag)

    function draw(){



    }
    
}

window.onload = init;

