// a rectangle with top faces of different colors
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Umbrella = undefined;
var MovingUmbrella = undefined;
var m4=twgl.m4;
var v3 = twgl.v3;
var a=0.5;var b=0.2*a;var c=0.2*a;
// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";
	 var lastTime=0;
    var shaderProgram = undefined;
    var buffers = undefined;
	var i;
    // constructor for Cubes
    Umbrella = function Umbrella(name, position, size, color,movement_dir,bounds,speed) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
		this.movement_dir=movement_dir||'X';
		this.bounds=bounds||[3,3,3];
		this.speed=speed||0.01;
		this.position_orignal=this.position;
    }
    Umbrella.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
		
				var vpos_data={data:[
					-a,-b,-c,  a,-b,-c,  a, b,-c,        -a,-b,-c,  a, b,-c, -a, b,-c,    // z = 0
                    -a,-b, c,  a,-b, c,  a, b, c,        -a,-b, c,  a, b, c, -a, b, c,    // z = 1
                    -a,-b,-c,  a,-b,-c,  a,-b, c,        -a,-b,-c,  a,-b, c, -a,-b, c,    // y = 0
                    -a, b,-c,  a, b,-c,  a, b, c,        -a, b,-c,  a, b, c, -a, b, c,    // y = 1
                    -a,-b,-c, -a, b,-c, -a, b, c,        -a,-b,-c, -a, b, c, -a,-b, c,    // x = 0
                     a,-b,-c,  a, b,-c,  a, b, c,         a,-b,-c,  a, b, c,  a,-b, c,    // x = 1
					 
					 0,2*b,2*c, 	a,b,c,  		0,-2*b,2*c,		0,-2*b,2*c,		a,b,c,			a,-b,c,
					 0,2*b,2*c,		0,2*b,-2*c,   	a,b,c,			a,b,c,			0,2*b,-2*c,		a,b,-c,
					 a,b,-c,		0,2*b,-2*c,		0,-2*b,-2*c,	a,b,-c,			0,-2*b,-2*c,	a,-b,-c,
					 a,-b,-c,		0,-2*b,-2*c,	0,-2*b,2*c,		a,-b,c,			a,-b,-c,		0,-2*b,2*c,
				]};
				
				var vnormal_data={data:[
					0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    0,0,0, 0,0,0, 0,0,0,        0,0,0, 0,0,0, 0,0,0,
					
					0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    0,0,0, 0,0,0, 0,0,0,        0,0,0, 0,0,0, 0,0,0,
				]
				};
				
			var e1,e2;	e1={};e2={};var normal;normal={};
			for (var i=0;i<18;i++)
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
    Umbrella .prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
		//var bounds=[3,1,1];
		advance(this,drawingState);
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
    Umbrella.prototype.center = function(drawingState) {
        return this.position;
    }


    ////////
    // constructor for Cubes
    MovingUmbrella  = function MovingUmbrella (name, position, size, color, axis) {
        Umbrella.apply(this,arguments);
        this.axis = axis || 'X';
    }
    MovingUmbrella .prototype = Object.create(Umbrella.prototype);
    MovingUmbrella .prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime);
		//twgl.m4.setTranslation(modelM,this.position,modelM);
		var kip=[];
		kip[0]=0+theta*100;kip[1]=b;kip[2]=c;
        if (this.axis == 'X') {
            twgl.m4.setTranslation(modelM,kip,modelM);
        } else if (this.axis == 'Z') {
            twgl.m4.setTranslation(modelM,kip,modelM);
        } else {
            twgl.m4.setTranslation(modelM,kip,modelM);
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
    MovingUmbrella .prototype.center = function(drawingState) {
        return this.position;
    }


})();

function advance(object,drawingState)
{
	// direction defines direction of movement
	//bounds specify the max directions of movement
	// speed is the speed of movement
	//,direction,bounds,speed
	
	if(object.movement_dir=='X'&&object.position[0]<object.bounds[0])
	{object.position[0]+=object.speed;}
	if(object.movement_dir=='Y'&&object.position[1]<object.bounds[1])
	{object.position[1]+=object.speed;}
	if(object.movement_dir=='Z'&&object.position[2]<object.bounds[2])
	{object.position[2]+=object.speed;}
	for(var j=0;j<3;j++)
	{if(object.position[j]>=object.bounds[j]){object.position[j]=-object.bounds[j];}}
}

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
//Umbrella = function Umbrella(name, position, size, color,movement_dir,bounds,speed) 
grobjects.push(new Umbrella("b1",[-2,-3,   0],1,[1,1,1],'Y',[3,3,3],0.05) );
grobjects.push(new Umbrella("b2",[ 2,-3,   0],1, [1,1,1],'Y',[3,3,3],0.05));
grobjects.push(new Umbrella("b3",[ 0, a+2, -2],1 , [0,0,1]));
grobjects.push(new Umbrella("b4",[ 0,a+2,   2],1,[0,0,1]));
grobjects.push(new Umbrella("b5",[ 0,0,0],1, [1,1,1],'Z',[3,3,3],0.02));


var x=2;var y=0.5;var z=2;
var xcenter=(a+b)/2;var zcenter=3*(b);//1.1 for offset
/*
grobjects.push(new MovingUmbrella ("s1",[-x,a, -z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new MovingUmbrella ("s2",[-x,a, -z-zcenter],-1,[1,0,0], 'Z') );
grobjects.push(new MovingUmbrella ("s1",[x,a, -z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new MovingUmbrella ("s2",[x,a, -z-zcenter],-1,[1,0,0], 'Z') );
grobjects.push(new MovingUmbrella ("s1",[-x,a, z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new MovingUmbrella ("s2",[-x,a, z-zcenter],-1,[1,0,0], 'Z') );
grobjects.push(new MovingUmbrella ("s1",[x,a, z+zcenter],1,[1,1,0], 'Z') );
grobjects.push(new MovingUmbrella ("s2",[x,a, z-zcenter],-1,[1,0,0], 'Z') );
*/
/*
grobjects.push(new MovingUmbrella ("s1",[-2,0.5, -2],1,[1,1,0], 'Z') );
grobjects.push(new MovingUmbrella ("s2",[-2,0.5,  2],1,  [1,1,0], 'Z'));
grobjects.push(new MovingUmbrella ("s3",[ 2,0.5, -2],1 , [1,1,0], 'Z'));
grobjects.push(new MovingUmbrella ("s4",[ 2,0.5,  2],1,[1,1,0], 'Z'));
grobjects.push(new MovingUmbrella ("s1",[-2,0.5, -3],-1,[1,0,0], 'Z') );
grobjects.push(new MovingUmbrella ("s2",[-2,0.5,  3],-1,  [1,0,0], 'Z'));
grobjects.push(new MovingUmbrella ("s3",[ 2,0.5, -3],-1 , [1,0,0], 'Z'));
grobjects.push(new MovingUmbrella ("s4",[ 2,0.5,  3],-1,[1,0,0], 'Z'));
*/