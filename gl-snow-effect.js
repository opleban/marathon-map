const numElements = 20000;
const particleSize= 0.000004;
const INF = 1e16
const bottomSnowLevel = 10000

// const minLat = 46.5
// const maxLat = 47.25
// const minLon = -122
// const maxLon = -121.5

// const lonRange =  maxLon - minLon;
// const latRange = maxLat - minLat;

vsSource=`
attribute vec3 a_trans;
attribute vec3 a_square;

uniform mat4 u_matrix;
uniform vec3 u_right;
uniform vec3 u_up;
uniform float u_size;

varying vec2 v_texcoord;

void main() {

  vec3 vertexPosition_worldspace = a_trans + u_right * a_square.x * u_size + u_up * a_square.y * u_size;

  gl_Position = u_matrix * vec4(vertexPosition_worldspace, 1.0);

  v_texcoord = a_square.xy + vec2(0.5,0.5);
}
`

fsSource =`
precision mediump float;
varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {

  vec4 u_color = vec4(0.99,0.99,0.99,1.0);
  vec4 baseColor = u_color;
  float dist = texture2D(u_texture, v_texcoord).a;

  float oFactor = smoothstep(0.65, 0.5, dist);
  baseColor = mix(u_color, vec4(1.0,1.0,1.0,1.0), oFactor);
  baseColor.a *= smoothstep(0.0, 0.8, dist);
  gl_FragColor = baseColor;

  if(gl_FragColor.a < 0.25)
    discard;
}
`

class Point {
  constructor({minLon, maxLon, minLat, maxLat}) {
    this.minLon = minLon;
    this.maxLon = maxLon;
    this.minLat = minLat;
    this.maxLat = maxLat;
     //x,y,z positions

    const point = mapboxgl.MercatorCoordinate.fromLngLat({
      lng: this.minLon + Math.random() * (this.maxLon - this.minLon),
      lat: this.minLat + Math.random() * (this.maxLat - this.minLat)
    },bottomSnowLevel);

    this.y = point.y;
    this.x = point.x;
    this.z = point.z;

    //x,y,z velocities
    this.vz = Math.random()*-0.000001 - 0.0000001;
    this.vx = 0;
    this.vy = 0;
  }

  propagate(delta) {
    this.y = this.y + delta*this.vy*100;
    this.x = this.x + delta*this.vx*100;
    this.z = this.z + delta*this.vz*100;
  }

  resetY() {
    //point has intersected surface
    if (this.z <= 0) {
      const point = mapboxgl.MercatorCoordinate.fromLngLat({
        lng: this.minLon + Math.random()* (this.maxLon-this.minLon),
        lat: this.minLat + Math.random()* (this.maxLat - this.minLat)
      }, bottomSnowLevel
      )
      this.y = point.y;
      this.x = point.x;
      this.z = point.z;
    }
  }
}

const createPoints = ({minLon, maxLon, minLat, maxLat}) => {
  //store data about points and their locations
  let _points = [];
  //location of particle center
  const tData = new Float32Array(numElements*18);
  //texture quad coordinates for billboards relative to particle center
  const vData = new Float32Array(numElements*18);

  for (let i=0; i<numElements; i++) {
    const point = new Point({minLon, maxLon, minLat, maxLat});
    _points.push(point);
    
    //translation of particle
    tData[i*18+0] = point.x;
    tData[i*18+1] = point.y;
    tData[i*18+2] = point.z;
    
    tData[i*18+3] = point.x;
    tData[i*18+4] = point.y;
    tData[i*18+5] = point.z;
    
    tData[i*18+6] = point.x;
    tData[i*18+7] = point.y;
    tData[i*18+8] = point.z;
    
    tData[i*18+9] = point.x;
    tData[i*18+10] = point.y;
    tData[i*18+11] = point.z;
    
    tData[i*18+12] = point.x;
    tData[i*18+13] = point.y;
    tData[i*18+14] = point.z;
    
    tData[i*18+15] = point.x;
    tData[i*18+16] = point.y;
    tData[i*18+17] = point.z;
    
    //billboard quad
    vData[i*18+0] = -0.5;
    vData[i*18+1] = -0.5;
    vData[i*18+2] = -0.5;
    
    vData[i*18+3] = 0.5;
    vData[i*18+4] = -0.5;
    vData[i*18+5] = -0.5;
    
    vData[i*18+6] = -0.5;
    vData[i*18+7] = 0.5;
    vData[i*18+8] = 0.5;
    
    vData[i*18+9] = -0.5;
    vData[i*18+10] = 0.5;
    vData[i*18+11] = 0.5;
    
    vData[i*18+12] = 0.5;
    vData[i*18+13] = -0.5;
    vData[i*18+14] = -0.5;
    
    vData[i*18+15] = 0.5;
    vData[i*18+16] = 0.5;
    vData[i*18+17] = 0.5;  
  }

  return {
    points: _points,
    tData,
    vData
  }
}


function TinySDF(size, buffer, value, radius, cutoff) {
  this.fontSize = size;
  this.buffer = buffer === undefined ? 3 : buffer;
  this.cutoff = cutoff || 0.25;
  this.radius = radius || 20;
  var size = this.size = this.fontSize + this.buffer * 2;
  this.canvas = document.createElement('canvas');
  this.canvas.width = this.canvas.height = size;
  this.circleWidth = this.canvas.width-10;

  this.ctx = this.canvas.getContext('2d');
  this.ctx.fillStyle = 'black';
   // temporary arrays for the distance transform
  this.gridOuter = new Float64Array(size * size);
  this.gridInner = new Float64Array(size * size);
  this.f = new Float64Array(size);
  this.z = new Float64Array(size + 1);
  this.v = new Uint16Array(size);

  // hack around https://bugzilla.mozilla.org/show_bug.cgi?id=737852
  this.middle = Math.round((size / 2) * (navigator.userAgent.indexOf('Gecko/') >= 0 ? 1.2 : 1));
}

TinySDF.prototype.draw = function (char) {
  this.ctx.arc(this.circleWidth/2, this.circleWidth/2, this.circleWidth/8, 0, 2 * Math.PI);
  this.ctx.fill();
  var imgData = this.ctx.getImageData(0, 0, this.size, this.size);

  var alphaChannel = new Uint8ClampedArray(this.size * this.size);

  for (var i = 0; i < this.size * this.size; i++) {
      var a = imgData.data[i * 4 + 3] / 255; // alpha value
      this.gridOuter[i] = a === 1 ? 0 : a === 0 ? INF : Math.pow(Math.max(0, 0.5 - a), 2);
      this.gridInner[i] = a === 1 ? INF : a === 0 ? 0 : Math.pow(Math.max(0, a - 0.5), 2);
    }

    this.edt(this.gridOuter, this.size, this.size, this.f, this.v, this.z);
    this.edt(this.gridInner, this.size, this.size, this.f, this.v, this.z);

    for (i = 0; i < this.size * this.size; i++) {
      var d = Math.sqrt(this.gridOuter[i]) - Math.sqrt(this.gridInner[i]);
      alphaChannel[i] = Math.round(255 - 255 * (d / this.radius + this.cutoff));
    }

    this.alphaChannel = alphaChannel;
    return alphaChannel;
  }

  TinySDF.prototype.edt = function (data, width, height, f, v, z) {
    for (var x = 0; x < width; x++) this.edt1d(data, x, width, height, f, v, z);
      for (var y = 0; y < height; y++) this.edt1d(data, y * width, 1, width, f, v, z);
    }

  TinySDF.prototype.edt1d = function (grid, offset, stride, length, f, v, z) {
    var q, k, s, r;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;

    for (q = 0; q < length; q++) f[q] = grid[offset + q * stride];

      for (q = 1, k = 0, s = 0; q < length; q++) {
        do {
          r = v[k];
          s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2;
        } while (s <= z[k] && --k > -1);

        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = INF;
      }

      for (q = 0, k = 0; q < length; q++) {
        while (z[k + 1] < q) k++;
        r = v[k];
        grid[offset + q * stride] = f[r] + (q - r) * (q - r);
      }
    }

    const exampleSDF = new TinySDF(64,0)

  function context2d(width, height, dpi) {
    if (dpi == null) dpi = devicePixelRatio;
    var canvas = document.createElement("canvas");
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    canvas.style.width = width + "px";
    var context = canvas.getContext("2d");
    context.scale(dpi, dpi);
    return context;
  }

// particleCanvas 
    const alpha = exampleSDF.draw();
    const ctx = context2d(exampleSDF.size, exampleSDF.size);
    ctx.canvas.height = exampleSDF.size;
    ctx.canvas.width = exampleSDF.size;
    const u = new Uint8ClampedArray(exampleSDF.size*exampleSDF.size*4);
    for (let i=0; i<alpha.length; i++) {
      u[4*i+3] = alpha[i];
    }
    const imageData = new ImageData(u,exampleSDF.size,exampleSDF.size);
    ctx.putImageData(imageData,0,0)
    const particleCanvas = ctx.canvas;

    const getView = (transform) => {
  // From geo/transform.js:
      const worldToCamera = transform._camera.getWorldToCamera(transform.worldSize, transform.pixelsPerMeter);
      const scaled = twgl.m4.scale(worldToCamera, [transform.worldSize, transform.worldSize, transform.worldSize/transform.pixelsPerMeter]);
      return scaled;
    }

    const normalizeV = (v) => {
      var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

  // make sure we don't divide by 0.
      if (length > 0) {
        return [v[0] / length, v[1] / length, v[2] / length];
      } else {
        return [0, 0, 0];
      }
    }

function renderFunction (points, map) {
  return function (gl, matrix) {
    const viewMatrix = twgl.m4.inverse(getView(map.transform));

 //vectors for billboard shader
    const cameraRight = normalizeV([viewMatrix[0], viewMatrix[1], viewMatrix[2]]);
    const cameraUp = normalizeV([viewMatrix[4], viewMatrix[5], viewMatrix[6]]);

  //draw particle billboards
    gl.useProgram(this.programInfo.program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const size = 3;          // 3 components per iteration
    let type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;  

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffersTrans);
    gl.bufferData(gl.ARRAY_BUFFER, points.tData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.programInfo.attribLocations.transAttributeLocation);
    gl.vertexAttribPointer(this.programInfo.attribLocations.transAttributeLocation, 3, type, normalize, stride, offset);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffersSquare);
    gl.bufferData(gl.ARRAY_BUFFER, points.vData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.programInfo.attribLocations.squareAttributeLocation);
    gl.vertexAttribPointer(this.programInfo.attribLocations.squareAttributeLocation, 3, type, normalize, stride, offset);

    // Set the matrix.
    gl.uniformMatrix4fv(this.programInfo.uniformLocations.matUniformLocation, false, matrix);
    gl.uniform3f(this.programInfo.uniformLocations.rightUniformLocation, cameraRight[0], cameraRight[1], cameraRight[2]);
    gl.uniform3f(this.programInfo.uniformLocations.upUniformLocation, cameraUp[0], cameraUp[1], cameraUp[2]);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.circleTexture);
    gl.uniform1i(this.programInfo.uniformLocations.textureUniformLocation, 1);
    
    gl.uniform1f(this.programInfo.uniformLocations.sizeUniformLocation, particleSize);

    var primitiveType = gl.TRIANGLES;
    offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, numElements*count);

    for (let i=0; i<numElements; i++) {
      points.points[i].resetY();
    }
  }

}


const initShaderProgram = (gl, vsSource, fsSource) => {
  //compile shaders
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  const success = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
  if (!success) {

    throw new Error(`Couldn't link shader`);
    gl.deleteProgram(shaderProgram);
  }
  
  return shaderProgram;
}

function programInfo (gl,vsSource,fsSource) {
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      positionAttributeLocation: gl.getAttribLocation(shaderProgram, "a_pos"),
      transAttributeLocation: gl.getAttribLocation(shaderProgram, "a_trans"),
      squareAttributeLocation: gl.getAttribLocation(shaderProgram, "a_square")
    },
    uniformLocations: {
      textureUniformLocation: gl.getUniformLocation(shaderProgram,"u_texture"),
      matUniformLocation: gl.getUniformLocation(shaderProgram,"u_matrix"),
      rightUniformLocation:gl.getUniformLocation(shaderProgram,"u_right"),
      upUniformLocation:gl.getUniformLocation(shaderProgram,"u_up"),
      sizeUniformLocation:gl.getUniformLocation(shaderProgram,"u_size")
    }
  };
  return programInfo;
}

//compiles shaders
const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error(`Couldn't compile shader`);
  }
  return shader;
}

