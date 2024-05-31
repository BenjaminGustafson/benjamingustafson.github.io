/**
 * Mesh
 * - Plain mesh
 * - Colored mesh
 *   - Vertices have a color
 * - Textured mesh
 *   - Vertices have a texCoord and textures
 *      - There might be multiple textures
 * 
 * should these be separate classes or can we just pass in [] if 
 * we don't want colors or textures
 * 
 * 
 * 
 */

class Mesh {

    constructor(gl, vertices, normals, indices, colors, texCoords, textures) {
        this.gl = gl;
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.colors = colors;
        this.texCoords = texCoords;
        this.textures = textures;
        this.setupMesh();
    }

    /**
     */
    setupMesh() {
        this.trianglePosBuffer = this.createAndBindBuffer(this.vertices,3);
        this.triangleNormalBuffer = this.createAndBindBuffer(this.normals,3);
        if (this.colors){
            this.colorBuffer = this.createAndBindBuffer(this.colors,3);
        }
        this.indexBuffer = this.createAndBindIndexBuffer(this.indices,3);
        if (this.texCoords){
            this.textureBuffer = this.createAndBindBuffer(this.texCoords,2);
        }
    }

    /**
     * Creates a buffer, binds it, and puts the input data
     * in as a Float32 array.
     * 
     * @param data 
     * @param itemSize 
     * @returns 
     */
    createAndBindBuffer(data, itemSize) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        buffer.itemSize = itemSize;
        return buffer;
    }

    createAndBindIndexBuffer(data, itemSize) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.gl.STATIC_DRAW);
        buffer.itemSize = itemSize;
        return buffer;
    }


    draw(shader, tModel, tCamera, tProjection) {
        const gl = this.gl;

        var tMV = mat4.create(); // model view
        var tMVn = mat3.create(); // model view normal
        var tMVP = mat4.create(); // model view projection
        mat4.multiply(tMV, tCamera, tModel);
        mat3.normalFromMat4(tMVn, tMV);
        mat4.multiply(tMVP, tProjection, tMV);

        shader.use();

        shader.addAttribute("PositionAttribute", "vPosition");
        shader.addAttribute("NormalAttribute", "vNormal");
        if (this.colors){
            shader.addAttribute("ColorAttribute", "vColor");
        }
        
        shader.addUniform("MVmatrix", "uMV");
        shader.addUniform("MVNormalmatrix", "uMVn");
        shader.addUniform("MVPmatrix", "uMVP");
        
        var shaderProgram = shader.shaderProgram;

        gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, this.trianglePosBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, this.triangleNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        if (this.textures){
            shader.addAttribute("texcoordAttribute", "vTexCoord");

            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
            gl.vertexAttribPointer(shaderProgram.texcoordAttribute, this.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
               
            for (let i = 0; i < this.textures.length; i++){
                gl.activeTexture(gl.TEXTURE0+i);
                gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            }
            
        }

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}