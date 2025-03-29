class SceneObject {
  constructor(gl, program, geometry, modelMatrix = mat4.create(), extraUniforms = {}) {
    this.gl = gl;
    this.program = program;
    this.modelMatrix = modelMatrix;
    this.indexCount = geometry.indices.length;
    this.extraUniforms = extraUniforms

    // Create VAO
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Position buffer
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    if (posLoc !== -1) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // Normal buffer (optional)
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
    const normLoc = gl.getAttribLocation(program, "a_normal");
    if (normLoc !== -1) {
      gl.enableVertexAttribArray(normLoc);
      gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // Index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
  }

  draw(viewProjectionMatrix, lightUniforms = {}, runtimeUniforms = {}) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    const combinedUniforms = { ...this.extraUniforms, ...runtimeUniforms, ...this.extraUniforms};

    // Compute matrices
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, this.modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    const mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, viewProjectionMatrix, this.modelMatrix);

    // Upload common uniforms if present
    const uVPMatrixLoc = gl.getUniformLocation(this.program, "u_viewProjectionMatrix");
    if (uVPMatrixLoc) gl.uniformMatrix4fv(uVPMatrixLoc, false, mvpMatrix);

    const uNormalMatrixLoc = gl.getUniformLocation(this.program, "u_normalMatrix");
    if (uNormalMatrixLoc) gl.uniformMatrix4fv(uNormalMatrixLoc, false, normalMatrix);

    const uLightDirLoc = gl.getUniformLocation(this.program, "u_lightDir");
    if (uLightDirLoc && lightUniforms.lightDir) {
      gl.uniform3fv(uLightDirLoc, lightUniforms.lightDir);
    }

    const uAmbientLoc = gl.getUniformLocation(this.program, "u_ambient");
    if (uAmbientLoc && lightUniforms.ambient) {
      gl.uniform1f(uAmbientLoc, lightUniforms.ambient);
    }

    const uModelMatrixLoc = gl.getUniformLocation(this.program, "u_modelMatrix");
    if (uModelMatrixLoc) gl.uniformMatrix4fv(uModelMatrixLoc, false, this.modelMatrix);

    const reflectionLoc = gl.getUniformLocation(this.program, "u_reflectionTex");
    if (reflectionLoc !== -1) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
      gl.uniform1i(reflectionLoc, 0);
    }

    // Upload extra custom uniforms (flexible for any shader)
    for (const [name, value] of Object.entries(combinedUniforms)) {
      const loc = gl.getUniformLocation(this.program, name);
      if (loc) {
        if (typeof value === "number") gl.uniform1f(loc, value);
        else if (value.length === 2) gl.uniform2fv(loc, value);
        else if (value.length === 3) gl.uniform3fv(loc, value);
        else if (value.length === 4) gl.uniform4fv(loc, value);
        else if (value.length === 16) gl.uniformMatrix4fv(loc, false, value);
      }
    }

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }
}
