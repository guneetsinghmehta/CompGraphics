// a rectangle with top faces of different colors
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Barfi = undefined;
var SpinningBarfi = undefined;
var a=a||0.5;
var b=b||0.1;
var m4=twgl.m4;
var v3 = twgl.v3;
// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";
	 
    var shaderProgram = undefined;
    var buffers = undefined;
	var i;
    // constructor for Cubes
    Barfi = function Barfi(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Barfi.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
		
				var vpos_data={data:[
					-a,-a,-a,  a,-a,-a,  a, a,-a,        -a,-a,-a,  a, a,-a, -a, a,-a,    // z = 0
                    -b,-b, b,  b,-b, b,  b, b, b,        -b,-b, b,  b, b, b, -b, b, b,    // z = 1
                    -a,-a,-a,  a,-a,-a,  b,-b, b,        -a,-a,-a,  b,-b, b, -b,-b, b,    // y = 0
                    -a, a,-a,  a, a,-a,  b, b, b,        -a, a,-a,  b, b, b, -b, b, b,    // y = 1
                    -a,-a,-a, -a, a,-a, -b, b, b,        -a,-a,-a, -b, b, b, -b,-b, b,    // x = 0
                     a,-a,-a,  a, a,-a,  b, b, b,         a,-a,-a,  b, b, b,  b,-b, b,    // x = 1
				]};
				
				var vnormal_data={data:[
					0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
				]
				};
			var e1,e2;	e1={};e2={};var normal;normal={};
			for (var i=0;i<12;i++)
			{	var p1,p2,p0;p1={};p2={};p0={};
				for(var j=0;j<3;j++)
				{
					p0[j]=vpos_data[9*i+j];p1[j]=vpos_data[9*i+j+3];p2[j]=vpos_data[9*i+j+6];
					e1[j]=p1[j]-p0[j];
					e2[j]=p2[j]-p1[j];
				}
				normal=v3.cross(e1,e2);
				normal=v3.normalize(normal);
				for(var j=0;j<3;j++)
				{
				   vnormal_data[9*i+3*j+0]=normal[0];vnormal_data[9*i+3*j+1]=normal[1];vnormal_data[9*i+3*j+2]=normal[2];
				}
			}
			
            var arrays = {};
			arrays.vpos=vpos_data;
			arrays.vnormal=vnormal_data;
			
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
			
        }

    };
    Barfi .prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Barfi.prototype.center = function(drawingState) {
        return this.position;
    }


    ////////
    // constructor for Cubes
    SpinningBarfi  = function SpinningBarfi (name, position, size, color, axis) {
        Barfi.apply(this,arguments);
        this.axis = axis || 'X';
    }
    SpinningBarfi .prototype = Object.create(Barfi.prototype);
    SpinningBarfi .prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/200.0;
		//twgl.m4.setTranslation(modelM,this.position,modelM);
        if (this.axis == 'X') {
            twgl.m4.rotateX(modelM, theta, modelM);
        } else if (this.axis == 'Z') {
            twgl.m4.rotateZ(modelM, theta, modelM);
        } else {
            twgl.m4.rotateY(modelM, theta, modelM);
        }
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningBarfi .prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Barfi("b1",[-2,0.5,   0],1) );
grobjects.push(new Barfi("b2",[ 2,0.5,   0],1, [1,1,0]));
grobjects.push(new Barfi("b3",[ 0, 0.5, -2],1 , [0,1,1]));
grobjects.push(new Barfi("b4",[ 0,0.5,   2],1));
grobjects.push(new Barfi("b5",[ 0,2.5,   2],1,[1,0,0]));

var x=2;var y=0.5;var z=2;
var xcenter=(a+b)/2;var zcenter=1*(a+b);//1.1 for offset
grobjects.push(new SpinningBarfi ("s1",[-x,0.5, -z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new SpinningBarfi ("s2",[-x,0.5, -z-zcenter],-1,[1,0,0], 'Z') );
grobjects.push(new SpinningBarfi ("s1",[x,0.5, -z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new SpinningBarfi ("s2",[x,0.5, -z-zcenter],-1,[1,0,0], 'Z') );
grobjects.push(new SpinningBarfi ("s1",[-x,0.5, z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new SpinningBarfi ("s2",[-x,0.5, z-zcenter],-1,[1,0,0], 'Z') );
grobjects.push(new SpinningBarfi ("s1",[x,0.5, z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new SpinningBarfi ("s2",[x,0.5, z-zcenter],-1,[1,0,0], 'Z') );
/*
grobjects.push(new SpinningBarfi ("s1",[-2,0.5, -2],1,[1,1,0], 'Z') );
grobjects.push(new SpinningBarfi ("s2",[-2,0.5,  2],1,  [1,1,0], 'Z'));
grobjects.push(new SpinningBarfi ("s3",[ 2,0.5, -2],1 , [1,1,0], 'Z'));
grobjects.push(new SpinningBarfi ("s4",[ 2,0.5,  2],1,[1,1,0], 'Z'));
grobjects.push(new SpinningBarfi ("s1",[-2,0.5, -3],-1,[1,0,0], 'Z') );
grobjects.push(new SpinningBarfi ("s2",[-2,0.5,  3],-1,  [1,0,0], 'Z'));
grobjects.push(new SpinningBarfi ("s3",[ 2,0.5, -3],-1 , [1,0,0], 'Z'));
grobjects.push(new SpinningBarfi ("s4",[ 2,0.5,  3],-1,[1,0,0], 'Z'));
*/