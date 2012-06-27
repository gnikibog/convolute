// http://www.phpied.com/files/canvas/matrix.html

function CanvasImage(canvas, src) {
  // load image in canvas
  var context = canvas.getContext('2d');
  var i = new Image();
  var that = this;
  i.onload = function(){
    canvas.width = i.width;
    canvas.height = i.height;
    context.drawImage(i, 0, 0, i.width, i.height);

    // remember the original pixels
    that.original = that.getData();
  };
  i.src = src;
  
  // cache these
  this.context = context;
  this.image = i;
}

CanvasImage.prototype.getData = function() {
  return this.context.getImageData(0, 0, this.image.width, this.image.height);
};

CanvasImage.prototype.setData = function(data) {
  return this.context.putImageData(data, 0, 0);
};

CanvasImage.prototype.reset = function() {
  this.setData(this.original);
}

CanvasImage.prototype.convolve = function(matrix, divisor, offset) {
  var m = [].concat(matrix[0], matrix[1], matrix[2]); // flatten
  if (!divisor) {
    divisor = m.reduce(function(a, b) {return a + b;}) || 1; // sum
  }
  var olddata = this.original;
  var oldpx = olddata.data;
  var newdata = this.context.createImageData(olddata);
  var newpx = newdata.data
  var len = newpx.length;
  var res = 0;
  var w = this.image.width;
  for (var i = 0; i < len; i++) {
    if ((i + 1) % 4 === 0) {
      newpx[i] = oldpx[i];
      continue;
    }
    res = 0;
    var these = [
      oldpx[i - w * 4 - 4] || oldpx[i],
      oldpx[i - w * 4]     || oldpx[i],
      oldpx[i - w * 4 + 4] || oldpx[i],
      oldpx[i - 4]         || oldpx[i],
      oldpx[i],
      oldpx[i + 4]         || oldpx[i],
      oldpx[i + w * 4 - 4] || oldpx[i],
      oldpx[i + w * 4]     || oldpx[i],
      oldpx[i + w * 4 + 4] || oldpx[i]
    ];
    for (var j = 0; j < 9; j++) {
      res += these[j] * m[j];
    }
    res /= divisor;
    if (offset) {
      res += offset;
    }
    newpx[i] = res;
  }
  this.setData(newdata);
};


var matrices = [
  {
    name: 'identity',
    data:
     [[ 0,  0,  0],
      [ 0,  1,  0],
      [ 0,  0,  0]]
  },
    {
    name: 'mean removal (sharpen)',
    data:
     [[-1, -1, -1],
      [-1,  9, -1],
      [-1, -1, -1]]
  },
  {
    name: 'sharpen',
    data:
     [[ 0, -2,  0],
      [-2, 11, -2],
      [ 0, -2,  0]]
  },
  {
    name: 'blur',
    data:
     [[ 1,  2,  1],
      [ 2,  4,  2],
      [ 1,  2,  1]]
  },
  {
    name: 'emboss',
    data:
     [[ 2,  0,  0],
      [ 0, -1,  0],
      [ 0,  0, -1]],
    offset: 127,
  },
  {
    name: 'emboss subtle',
    data:
     [[ 1,  1, -1],
      [ 1,  3, -1],
      [ 1, -1, -1]],
  },
  {
    name: 'edge detect',
    data:
     [[ 1,  1,  1],
      [ 1, -7,  1],
      [ 1,  1,  1]],
  },
  {
    name: 'edge detect 2',
    data:
     [[-5,  0,  0],
      [ 0,  0,  0],
      [ 0,  0,  5]],
  }
];