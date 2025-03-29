
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
  
  function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
  }
  
  function computeFlatNormals(vertices, indices) {
    const normals = new Float32Array(vertices.length);
    
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
  
      const v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]];
      const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
      const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];
  
      // Compute vectors
      const a = vec3.sub([], v1, v0);
      const b = vec3.sub([], v2, v0);
  
      // Compute cross product (face normal)
      const normal = vec3.cross([], a, b);
      vec3.normalize(normal, normal);
  
      // Add this normal to each of the 3 vertices
      for (let j of [i0, i1, i2]) {
        normals[j]     = normal[0];
        normals[j + 1] = normal[1];
        normals[j + 2] = normal[2];
      }
    }
  
    return normals;
  }
  
  function computeSmoothNormals(vertices, indices) {
    const normals = new Float32Array(vertices.length);
    const counts = new Array(vertices.length / 3).fill(0);
  
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i];
      const i1 = indices[i + 1];
      const i2 = indices[i + 2];
  
      const v0 = vertices.slice(i0 * 3, i0 * 3 + 3);
      const v1 = vertices.slice(i1 * 3, i1 * 3 + 3);
      const v2 = vertices.slice(i2 * 3, i2 * 3 + 3);
  
      const a = vec3.sub([], v1, v0);
      const b = vec3.sub([], v2, v0);
      const faceNormal = vec3.cross([], a, b);
      vec3.normalize(faceNormal, faceNormal);
  
      for (let j of [i0, i1, i2]) {
        normals[j * 3 + 0] += faceNormal[0];
        normals[j * 3 + 1] += faceNormal[1];
        normals[j * 3 + 2] += faceNormal[2];
        counts[j]++;
      }
    }
  
    // Normalize each vertex normal
    for (let i = 0; i < counts.length; ++i) {
      const offset = i * 3;
      const n = normals.slice(offset, offset + 3);
      vec3.normalize(n, n);
      normals.set(n, offset);
    }
  
    return normals;
  }