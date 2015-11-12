/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the cube is more complicated since it is designed to allow making many cubes

 we make a constructor function that will make instances of cubes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all cubes - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each cube instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cube = undefined;
var SpinningCube = undefined;
var tankSteps = 0;
var pImage2 = undefined;
var pTexture = undefined;
var angle = 0.0;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram_house = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(name, position, size, color, direction) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 0.3;
        this.color = color || [1,0,.0];
        this.direction = direction;
    }



    function wait(ms){
       var start = new Date().getTime();
       var end = start;
       while(end < start + ms) {
         end = new Date().getTime();
      }
    }
    // var createGLTexture = function (gl, image, flipY) {
    //     var texture = gl.createTexture();
    //     gl.activeTexture(gl.TEXTURE0);
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     if(flipY){
    //         gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //     }
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
    //     gl.generateMipmap(gl.TEXTURE_2D);
    //     gl.bindTexture(gl.TEXTURE_2D, null);
    //     return texture;
    // }

    var setUpTexture = function(gl)
    {

        var texture1 = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        pImage2 = new Image();
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture1;
    }


    function initTexture(texture, gl)
    {

      pImage2.onload = function() { loadTexture(pImage2,texture, gl); };
      pImage2.crossOrigin = "anonymous";
      //pImage2.src = "https://lh3.googleusercontent.com/-xX-m9F-ax7c/ViSDMRbutoI/AAAAAAAABWs/A3L33oEWBCw/s512-Ic42/spirit.jpg";
      pImage2.src = "data:image/jpeg;base64,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";
       //wait(1000);
      //window.setTimeout(draw,200);

    }

    function loadTexture(image,texture, gl)
    {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Option 1 : Use mipmap, select interpolation mode
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
      }
    

    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram_house) {
            shaderProgram_house = twgl.createProgramInfo(gl, ["house-vs", "house-fs"]);
           // pImage2 = new Image();

            //pImage2.crossOrigin = "anonymous";

            //pImage2.src = "https://lh3.googleusercontent.com/-xX-m9F-ax7c/ViSDMRbutoI/AAAAAAAABWs/A3L33oEWBCw/s512-Ic42/spirit.jpg";
    
            //wait(10000);
            // this.texture = createGLTexture(gl, pImage2, true);
            this.texture = setUpTexture(gl);
            initTexture(this.texture, gl);

        }

        
        var str = 
'# www.blender.org\n'+
'mtllib building.mtl\n'+
'o Cube_Cube.001\n'+
'v 5.039317 0.056435 3.958236\n'+
'v 5.039317 6.811982 3.958236\n'+
'v 1.748649 0.056435 3.968200\n'+
'v 1.748649 6.811982 3.968200\n'+
'v 5.018990 0.056435 2.345339\n'+
'v 5.018990 6.811982 2.345339\n'+
'v 1.728321 0.056435 2.355303\n'+
'v 1.728321 6.811982 2.355303\n'+
'vt 0.005727 0.583527\n'+
'vt 0.829156 1.036861\n'+
'vt 0.999156 0.029959\n'+
'vt 0.775495 1.060142\n'+
'vt 0.066167 0.193951\n'+
'vt 0.715495 0.098056\n'+
'vt 0.722218 0.980850\n'+
'vt -0.097783 0.400279\n'+
'vt 0.883599 -0.017499\n'+
'vt 0.221052 1.114184\n'+
'vt 0.236051 -0.026388\n'+
'vt 0.717608 0.009167\n'+
'vt 0.478749 0.048654\n'+
'vt 0.758749 0.975866\n'+
'vt 0.057374 0.519699\n'+
'vt 0.034156 0.812542\n'+
'vt 0.598420 -0.002583\n'+
'vt 0.853749 0.812542\n'+
'vt 0.770727 -0.213055\n'+
'vt 0.435727 1.220513\n'+
'vt 0.174156 0.151389\n'+
'vt 0.980611 0.848691\n'+
'vt 0.141283 0.989030\n'+
'vt 0.576283 -0.079722\n'+
'vt 0.986661 0.998627\n'+
'vt -0.184722 0.687517\n'+
'vt 1.041660 0.053612\n'+
'vt 0.889722 1.007516\n'+
'vt 0.058165 0.527517\n'+
'vt 0.669720 -0.035277\n'+
'vt 0.111284 0.305142\n'+
'vt 0.712659 0.281309\n'+
'vt 0.551284 1.054577\n'+
'vt 0.750608 1.129864\n'+
'vt 0.130278 0.199184\n'+
'vt 0.809872 -0.103038\n'+
'vn 0.003000 0.000000 1.000000\n'+
'vn -0.999900 0.000000 0.012600\n'+
'vn -0.003000 0.000000 -1.000000\n'+
'vn 0.999900 0.000000 -0.012600\n'+
'vn 0.000000 -1.000000 0.000000\n'+
'vn 0.000000 1.000000 0.000000\n'+
'usemtl None\n'+
's off\n'+
'f 4/1/1 3/2/1 1/3/1\n'+
'f 8/4/2 7/5/2 3/6/2\n'+
'f 6/7/3 5/8/3 7/9/3\n'+
'f 2/10/4 1/11/4 5/12/4\n'+
'f 3/13/5 7/14/5 5/15/5\n'+
'f 6/16/6 8/17/6 4/18/6\n'+
'f 2/19/1 4/20/1 1/21/1\n'+
'f 4/22/2 8/23/2 3/24/2\n'+
'f 8/25/3 6/26/3 7/27/3\n'+
'f 6/28/4 2/29/4 5/30/4\n'+
'f 1/31/5 3/32/5 5/33/5\n'+
'f 2/34/6 6/35/6 4/36/6\n';



        var parsedobj = parseFaceShadedOBJ(str);


        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: parsedobj.verts},
                vnormal : {numComponents:3, data: parsedobj.norms},
                vTexCoord : {numComponents : 2, data: parsedobj.txtcos}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

        }

    };
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        

        
        var dir = [0,0,0];

        if(this.direction == 0)
            dir = [-15.0, 0.0, 0.0];
        if(this.direction == 1)
            dir = [0.0, tankSteps, 0.0];
        if(this.direction == 2)
            dir = [0.0, 0.0, tankSteps];
        angle += 0.0006*Math.PI;
        if(angle > 0.005*Math.PI)
            angle = - 0.005*Math.PI;
        var modelMB = twgl.m4.scaling([0.5,0.4,0.4]);
        twgl.m4.rotationZ(angle, modelMB);
        twgl.m4.rotationX(angle, modelMB);
        
        
        twgl.m4.setTranslation(modelMB,this.position,modelMB);

        

        twgl.m4.translate(modelMB, [dir[0], dir[1], dir[2]], modelMB);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;

        gl.useProgram(shaderProgram_house.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram_house,buffers);
         shaderProgram_house.program.texSampler1 = gl.getUniformLocation(shaderProgram_house.program, "texSampler1");
        gl.uniform1i(shaderProgram_house.program.texSampler1, 0);
        twgl.setUniforms(shaderProgram_house,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:[1,0,0], model: modelMB });
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        //shaderProgram_house.program.texSampler1 = gl.getUniformLocation(shaderProgram_house.program, "texSampler1");
        //gl.uniform1i(shaderProgram_house.program.texSampler1, 0);
        twgl.drawBufferInfo(gl, gl.TRIANGLE_STRIP, buffers);
    };
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Cube("cube1",[3,0.2,-7],1, 0, 0) );


