class SceneObject {
    constructor(gl, program, geometry, modelMatrix = mat4.create()) {
        this.gl = gl;
        this.program = program;
        this.modelMatrix = modelMatrix;
        this.indexCount = geometry.indices.length;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Positions
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(program, "a_position");
        if (posLoc !== -1) {
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        }else{
            console.error("a_position location is -1")
        }

        // Normals
        let normals = geometry.normals;
        if (!normals) {
            console.warn("Auto computing normals")
            normals =  this.computeSmoothNormals(geometry.positions, geometry.indices)
        }
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        const normLoc = gl.getAttribLocation(program, "a_normal");
        if (normLoc !== -1) {
            gl.enableVertexAttribArray(normLoc);
            gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
        }else{
            console.error("a_normal location is -1")
        }

        // Indices
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);

    }

    draw(viewProjectionMatrix, uniforms = []) {
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // Compute matrices
        const normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, this.modelMatrix);

        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, viewProjectionMatrix, this.modelMatrix);


        this.setUniform("u_modelMatrix", this.modelMatrix, "mat4");
        this.setUniform("u_normalMatrix", normalMatrix, "mat3");
        this.setUniform("u_mvpMatrix", mvpMatrix, "mat4");

        // Set uniforms
        for (let i = 0; i <  uniforms.length; i++) {
            let uniform = uniforms[i]
            this.setUniform(uniform[0], uniform[1], uniform[2])
        }

        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    dispose() {
        const gl = this.gl;
        gl.deleteBuffer(this.positionBuffer);
        gl.deleteBuffer(this.normalBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteVertexArray(this.vao);
    }
      

    setUniform(name, value, type) {
        const gl = this.gl;
        const program = this.program;
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
    


    computeSmoothNormals(vertices, indices) {
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
}


