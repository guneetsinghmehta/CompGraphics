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
var pImage4;
// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size ||[ 0.25,1.0,0.25];
        this.color = color || [1.0,0.0,0.0];
    }
	function wait(ms){
       var start = new Date().getTime();
       var end = start;
       while(end < start + ms) {
         end = new Date().getTime();
      }
    }
    
    var setUpTexture = function(gl)
    {

        var texture0 = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        pImage4 = new Image();
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture0;
    }
	function degreeToRadians(degree)
	{
		return (degree/180*Math.PI);
	}

    function initTexture(texture, gl)
    {

      pImage4.onload = function() { loadTexture(pImage4,texture, gl); };
      pImage4.crossOrigin = "anonymous";
	  pImage4.src ="https://lh3.googleusercontent.com/-NHFowHVgtxk/Viaf_KWl6eI/AAAAAAAABYA/gtAN2mNtQAs/s256-Ic42/normalmap.jpg";
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
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["graf-vs", "graf-fs"]);
			this.texture = setUpTexture(gl);
            initTexture(this.texture, gl);
        }
		var a=0.5;
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,  
					-.5,-.5,-.5,  -.5,.5,-.5,  .5, .5,-.5, 
					
					 -.5,-.5,.5,  .5,-.5,.5,  .5, .5,.5,  
					-.5,-.5,.5,  -.5,.5,.5,  .5, .5,.5, 
					
					a,-a,a,  a,-a,-a, a,a,-a,
					a,-a,a,  a,a,a,   a,a,-a,
					
					-a,-a,a,  -a,-a,-a, -a,a,-a,
					-a,-a,a,  -a,a,a,   -a,a,-a,
					
					-a,a,a, a,a,a,  a,a,-a,
					-a,a,a , -a,a,-a, a,a,-a,
					
					-a,-a,a, a,-a,a,  a,-a,-a,
					-a,-a,a , -a,-a,-a, a,-a,-a,
					
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,
					0,0,-1, 0,0,-1, 0,0,-1,

					0,0,1, 0,0,1, 0,0,1,
					0,0,1, 0,0,1, 0,0,1,	
						
					1,0,0,  1,0,0,  1,0,0,	
					1,0,0,  1,0,0,  1,0,0,	
					
					-1,0,0,  -1,0,0,  -1,0,0,	
					-1,0,0,  -1,0,0,  -1,0,0,	
					
					0,1,0, 	0,1,0,	0,1,0,
					0,1,0,	0,1,0,	0,1,0,
					
					0,-1,0,	0,-1,0,	0,-1,0,
					0,-1,0,	0,-1,0,	0,-1,0,
					
                ]},
				
				uvs: {numComponents:2, data: [
                    0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  

					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
					
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
	
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,
					
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,  
					
					0,0,  1,0,  1,1,     
					0,0,  0,1,  1,1,
			
					
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
	
	/*
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["test-vs", "test-fs"]);
            this.texture = setUpTexture(gl);
            initTexture(this.texture, gl);

        }
    };*/
	
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling(this.size);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
		
		shaderProgram.program.texSampler1 = gl.getUniformLocation(shaderProgram.program, "texSampler1");
		gl.uniform1i(shaderProgram.program.texSampler1, 0);
		
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
			
			
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);	
			
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
//Cube = function Cube(name, position, size, color) 
grobjects.push(new Cube("cube1",[4,1.25, 0.0],[1.0,2.5,3],[0.8,0.8,1],[0,0,0]) );
grobjects.push(new Cube("cube1",[5,0.25, 0.0],[0.1,0.5,10],[0.8,0.8,1],[0,0,0]) );

