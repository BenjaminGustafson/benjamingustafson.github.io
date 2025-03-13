/**
 * Todo:
 * - be able to draw multiple objects with distinct meshes, textures and shaders
 * - draw a skybox
 * - implement environmental mapping
 * - add better camera controls
 * - bump map
 * - lighting
 * - procedural textures
 * 
 * 
 */

function start() {

    // Get canvas, WebGL context, twgl.m4
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // Set up shaders
    var texShader = new Shader(gl, "texVert", "texFrag")
    
    //texShader.addUniform("texSampler2","texSampler2", 1)

    var reflectShader = new Shader(gl, "reflectVert", "reflectFrag")


    // Set up textures

    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image1 = new Image();

    var texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image2 = new Image();

    function loadTexture(image,texture)
    {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Option 1 : Use mipmap, select interpolation mode
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

      // Option 2: At least use linear filters
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Optional ... if your shader & texture coordinates go outside the [0,1] range
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }  

    image1.onload = function() { loadTexture(image1,texture1); };
    image1.crossOrigin = "anonymous";
    image1.src = "https://benjamingustafson.github.io/textures/grass.png";

    image2.onload = function() { loadTexture(image2,texture2); };
    image2.crossOrigin = "anonymous";
    image2.src = "https://farm6.staticflickr.com/5726/30206830053_87e9530b48_b.jpg";

    // Set up meshes
    
    // Mesh for terrain
    var terrainTextures = [texture1, texture2];
    var terrain = new Terrain();
    var terrainMesh = new Mesh(gl, terrain.verts, terrain.normals, terrain.indices, [], terrain.texCoords, terrainTextures)
    
    // Mesh for plane
    var planeColors = []
    for (let i = 0; i < plane.vertexPos.length; i++) {
        planeColors.push(1);
    }
    var planeMesh = new Mesh(gl, plane.vertexPos, plane.vertexNormals, plane.triangleIndices, planeColors, [], []);

    // Set up player position
    playerPos = vec3.create()
    playerLookDir = vec3.fromValues(0, -400, -300);
    vec3.normalize(playerLookDir, playerLookDir);
    playerLookUp = vec3.fromValues(0, 0, 1);


    // Scene (re-)draw routine
    function draw() {

        var tCamera = mat4.create();
        mat4.lookAt(tCamera, [0, 0.0, 0], playerLookDir, playerLookUp);

        var playerTransform = vec3.create();
        vec3.scale(playerTransform, playerPos, -1)

        var tProjection = mat4.create();
        mat4.perspective(tProjection, Math.PI / 4, 1, 10, 100000);

        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        var tModelPlane = mat4.create();
        mat4.scale(tModelPlane, tModelPlane, [100, 100, 100]);
        mat4.translate(tModelPlane, tModelPlane, [0, -7, -6]);
        mat4.rotateX(tModelPlane, tModelPlane, 1.9)        

        var tModelTerrain = mat4.create();
        mat4.fromScaling(tModelTerrain, [100, 100, 100]);
        mat4.translate(tModelTerrain, tModelTerrain, [-20, -50, -30]);
        mat4.translate(tModelTerrain, tModelTerrain, playerTransform);
        
        terrainMesh.setupMesh()
        terrainMesh.draw(texShader, tModelTerrain, tCamera, tProjection);
        //terrainMesh.draw(gl, reflectShader, tModelTerrain, tCamera, tProjection);

        planeMesh.setupMesh()
        planeMesh.draw(reflectShader, tModelPlane, tCamera, tProjection);
    }

    // UI for moving player and looking
    speed = 0.1
    lookSpeed = 0.02
    document.addEventListener('keydown', (event) => {

        if (event.shiftKey) {
            const down = vec3.create();
            vec3.scale(down, playerLookUp, -speed);
            vec3.add(playerPos, playerPos, down);
        }

        switch (event.key) {
            case 'w':
                const forward = vec3.create();
                vec3.scale(forward, playerLookDir, speed);
                vec3.add(playerPos, playerPos, forward);
                break;
            case 'a':
                const left = vec3.create();
                vec3.cross(left, playerLookUp, playerLookDir);
                vec3.scale(left, left, speed);
                vec3.add(playerPos, playerPos, left);
                break;
            case 's':
                const back = vec3.create();
                vec3.scale(back, playerLookDir, -speed);
                vec3.add(playerPos, playerPos, back);
                break;
            case 'd':
                const right = vec3.create();
                vec3.cross(right, playerLookUp, playerLookDir);
                vec3.scale(right, right, -speed);
                vec3.add(playerPos, playerPos, right);
                break;
            case ' ':
                const down = vec3.create();
                vec3.scale(down, playerLookUp, speed);
                vec3.add(playerPos, playerPos, down);
                break;

            case 'ArrowLeft':
                vec3.rotateZ(playerLookDir, playerLookDir, [0, 0, 0], lookSpeed)
                vec3.normalize(playerLookDir, playerLookDir);
                break;
            case 'ArrowRight':
                vec3.rotateZ(playerLookDir, playerLookDir, [0, 0, 0], -lookSpeed)
                vec3.normalize(playerLookDir, playerLookDir);
                break;
        }
        //console.log(playerPos)
        draw();
    });


    window.setTimeout(draw, 200);
}

window.onload = start;
