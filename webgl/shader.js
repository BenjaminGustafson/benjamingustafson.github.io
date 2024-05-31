class Shader{

    constructor (gl, vertexSource, fragmentSource){
        this.gl = gl;

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader,vertexSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(vertexShader))
        };
    
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader,fragmentSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(fragmentShader))
        };
        
        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialize shaders");
        }

    }

    use (){
        this.gl.useProgram(this.shaderProgram);
    }

}

