/**
 * Created by Yusef.
 */

/**
 A Very Simple Textured Plane using native WebGL. 

 Notice that it is possible to only use twgl for math. 

 Also, due to security restrictions the image was encoded as a Base64 string. 
 It is very simple to use somthing like this (http://dataurl.net/#dataurlmaker) to create one
 then its as simple as 
     var image = new Image()
     image.src = <base64string>


 **/

var grobjects = grobjects || [];


(function() {
    "use strict";
	
    var vertexSource = ""+
        "precision highp float;" +
        "attribute vec3 aPosition;" +
        "attribute vec2 aTexCoord;" +
        "varying vec2 vTexCoord;" +
        "uniform mat4 pMatrix;" +
        "uniform mat4 vMatrix;" +
        "uniform mat4 mMatrix;" +
        "void main(void) {" +
        "  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aPosition, 1.0);" +
        "  vTexCoord = aTexCoord;" +
        "}";

    var fragmentSource = "" +
        "precision highp float;" +
        "varying vec2 vTexCoord;" +
        "uniform sampler2D uTexture;" +
        "void main(void) {" +
        "  gl_FragColor = texture2D(uTexture, vTexCoord);" +
        "}";

	var d=1.0;
    var vertices = new Float32Array([
		
		d,0.0,d,
		-d,0.0,d,
		-d,0.0,-d,
		
		d,0.0,d,
		-d,0.0,-d,
		d,0.0,-d
		
	/*
         0.5,  0.5,  0.0,
        -0.5,  0.5,  0.0,
        -0.5, -0.5,  0.0,

         0.5,  0.5,  0.0,
        -0.5, -0.5,  0.0,
         0.5, -0.5,  0.0
		 */
    ]);

    var uvs = new Float32Array([
       1.0, 1.0,
       0.0, 1.0,
       0.0, 0.0,

       1.0, 1.0,
       0.0, 0.0,
       1.0, 0.0
    ]);

    //useful util function to simplify shader creation. type is either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    var createGLShader = function (gl, type, src) {
        var shader = gl.createShader(type)
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log("warning: shader failed to compile!")
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    //see above comment on how this works. 
    var image = new Image();
    image.src ="data:image/png;base64,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MyNRIZCCQNCJkIJd/yBbBmXY6d8otv5VcCMC0xAggEylbBFA5DxnzSsyc7Eh8MfXXigkIjDroJw1r0StJdQ1CRBAprrPOihnzStTb4l1SQIEkKnssw7KWfPK1FtiXZIAAWQq+6yDcta8MvWWWJckQACZyj7roJw1r0y9JdYlCRBAprLPOihnzStTb4l1SQIEkKnssw7KWfPK1FtiXZIAAWQq+6yDcta8MvWWWJckQACZyr79zzlE/l3fbcoEkKkLxToRAQKYqJhSQQABBEoIEEAJLWsRQACBiQgQwETFlAoCCCBQQoAASmhZiwACCExEgAAmKqZUEEAAgRICBFBCy1oEEEBgIgIEMFExpYIAAgiUECCAElrWIoAAAhMRIICJiikVBBBAoIQAAZTQshYBBBCYiAABTFRMqSCAAAIlBAighJa1CCCAwEQECGCiYkoFAQQQKCFAACW0rEUAAQQmIkAAExVTKggggEAJAQIooWUtAgggMBEBApiomFJBAAEESggQQAktaxFAAIGJCBDARMWUCgIIIFBCgABKaFmLAAIITESAACYqplQQQACBEgIEUELLWgQQQGAiAgQwUTGlggACCJQQIIASWtYigAACExEggImKKRUEEECghAABlNCyFgEEEJiIAAFMVEypIIAAAiUECKCElrUIIIDARAQIYKJiSgUBBBAoIUAAJbSsRQABBCYiQAATFVMqCCCAQAkBAiihZS0CCCAwEQECmKiYUkEAAQRKCBBACS1rEUAAgYkIEMBExZQKAgggUEKAAEpoWYsAAghMRIAAJiqmVBBAAIESAgRQQstaBBBAYCICBDBRMaWCAAIIlBAggBJa1iKAAAITESCAiYopFQQQQKCEAAGU0LIWAQQQmIgAAUxUTKkggAACJQQIoISWtQgggMBEBAhgomJKBQEEECghQAAltKxFAAEEJiJAABMVUyoIIIBACQECKKFlLQIIIDARAQKYqJhSQQABBEoIEEAJLWsRQACBiQgQwETFlAoCCCBQQoAASmhZiwACCExEgAAmKqZUEEAAgRICBFBCy1oEEEBgIgIEMFExpYIAAgiUECCAElrWIoAAAhMRIICJiikVBBBAoIQAAZTQshYBBBCYiAABTFRMqSCAAAIlBAighJa1CCCAwEQECGCiYkoFAQQQKCFAACW0rEUAAQQmIkAAExVTKggggEAJAQIooWUtAgggMBEBApiomFJBAAEESggQQAktaxFAAIGJCPw/PvPLepdFX8QAAAAASUVORK5CYII=";
	//image.onload = LoadTexture;
      image.crossOrigin = "anonymous";
      //image.src = "https://lh3.googleusercontent.com/-xX-m9F-ax7c/ViSDMRbutoI/AAAAAAAABWs/A3L33oEWBCw/s512-Ic42/spirit.jpg";
	 // image.src = "http://www.fancyicons.com/free-icons/142/transport-for-vista/png/256/helicopter_256.png";
	
    //useful util function to return a glProgram from just vertex and fragment shader source.
    var createGLProgram = function (gl, vSrc, fSrc) {
        var program = gl.createProgram();
        var vShader = createGLShader(gl, gl.VERTEX_SHADER, vSrc);
        var fShader = createGLShader(gl, gl.FRAGMENT_SHADER, fSrc);
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            console.log("warning: program failed to link");
            return null;

        }
        return program;
    }

    //creates a gl buffer and unbinds it when done. 
    var createGLBuffer = function (gl, data, usage) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    var findAttribLocations = function (gl, program, attributes) {
        var out = {};
        for(var i = 0; i < attributes.length;i++){
            var attrib = attributes[i];
            out[attrib] = gl.getAttribLocation(program, attrib);
        }
        return out;
    }

    var findUniformLocations = function (gl, program, uniforms) {
        var out = {};
        for(var i = 0; i < uniforms.length;i++){
            var uniform = uniforms[i];
            out[uniform] = gl.getUniformLocation(program, uniform);
        }
        return out;
    }

    var enableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.enableVertexAttribArray(location);
        }
    }

    //always a good idea to clean up your attrib location bindings when done. You wont regret it later. 
    var disableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.disableVertexAttribArray(location);
        }
    }

    //creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
    //it's mostly going to be a try it once, flip if you need to. 
    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

     var TexturedPlane = function () {
        this.name = "TexturedPlane"
        this.position = new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1]);
        this.program = null;
        this.attributes = null;
        this.uniforms = null;
        this.buffers = [null, null]
        this.texture = null;
    }

    TexturedPlane.prototype.init = function (drawingState) {
        var gl = drawingState.gl;

        this.program = createGLProgram(gl, vertexSource, fragmentSource);
        this.attributes = findAttribLocations(gl, this.program, ["aPosition", "aTexCoord"]);
        this.uniforms = findUniformLocations(gl, this.program, ["pMatrix", "vMatrix", "mMatrix", "uTexture"]);

        this.texture = createGLTexture(gl, image, true);

        this.buffers[0] = createGLBuffer(gl, vertices, gl.STATIC_DRAW);
        this.buffers[1] = createGLBuffer(gl, uvs, gl.STATIC_DRAW);
    }

    TexturedPlane.prototype.center = function () {
        return this.position;
    }

    TexturedPlane.prototype.draw = function (drawingState) {
        var gl = drawingState.gl;

        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);

        var modelM = twgl.m4.scaling([this.scale[0], 1,this.scale[1]]);
        twgl.m4.setTranslation(modelM,this.position, modelM);

        gl.uniformMatrix4fv(this.uniforms.pMatrix, gl.FALSE, drawingState.proj);
        gl.uniformMatrix4fv(this.uniforms.vMatrix, gl.FALSE, drawingState.view);
        gl.uniformMatrix4fv(this.uniforms.mMatrix, gl.FALSE, modelM);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniforms.uTexture, 0);



        enableLocations(gl, this.attributes)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(this.attributes.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(this.attributes.aTexCoord, 2, gl.FLOAT, false, 0, 0);

        

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        disableLocations(gl, this.attributes);
    }


    var test = new TexturedPlane();
        test.position[1] = 0;

        test.scale = [5, 5];

    grobjects.push(test);

})();