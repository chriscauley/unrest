uR.canvas = {};

uR.canvas.CanvasObject = class CanvasObject extends uR.Object {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{});
    this.animations = [];
    this._ta = 200;
  }
  newCanvas(attrs={}) {
    uR.defaults(attrs,{
      width: this.width,
      height: this.height,
      parent: this.parent,
      name: "canvas", // only counts for the first one
    });
    attrs.width = attrs.width || attrs.parent.scrollWidth;
    attrs.height = attrs.height || attrs.parent.scrollHeight;
    var canvas = uR.newElement("canvas",attrs);
    canvas.scrollX = 0;
    canvas.scrollY = 0
    canvas.x_max = attrs.x_max;
    canvas.y_max = attrs.y_max;
    canvas.ctx = canvas.getContext("2d");
    canvas.ctx.imageSmoothingEnabled= false;
    canvas.clear = function clear(x,y,w,h) {
      if (!arguments.length) {
        x = y = -1;
        w = canvas.width+2;
        h = canvas.height+2;
      }
      canvas.ctx.clearRect(x,y,w,h);
      if (attrs.bg) {
        canvas.ctx.drawImage(
          attrs.bg, //image
          this.scrollX,this.scrollY, //sx, sy
          canvas.width,canvas.height, //sw,sh
          0,0, //dx,dy
          canvas.width,canvas.height, //dw,dh
        )
      }
      canvas.dirty = false;
    }
    canvas.circle = function circle(x,y,r,start,end) {
      start = start || 0;
      end = (end==undefined)?2*Math.PI:end;
      var ctx = canvas.ctx;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.arc(x,y,r,start,end)
      ctx.fill();
    }
    if (attrs.name && !this[attrs.name]) { this[attrs.name] = canvas; }
    if (attrs.controller) {
      this.controller = new uR.controller.Controller({
        parent: this,
        target: canvas,
      });
    }
    canvas.drawPolygon = function(paths,opts={}) {
      var ctx = canvas.ctx;
      if (opts.fillStyle) { ctx.fillStyle = opts.fillStyle }
      ctx.beginPath();
      ctx.moveTo.apply(ctx,paths[0]);
      for (var i=1;i<paths.length;i++) {
        ctx.lineTo.apply(ctx,paths[i]);
      }
      ctx.closePath();
      ctx.fill();
    }
    var animation_frame, __tick=0
    canvas.tick = function() {
      cancelAnimationFrame(animation_frame);
      (__tick++ && canvas.dirty)%5 && canvas.clear();
      animation_frame = requestAnimationFrame(canvas.tick);
    }
    return canvas;
  }
  mousewheel(e) {
    var target = e.target;
    e.preventDefault();
    target.scrollX = Math.floor(uR.math.between(0,target.scrollX+e.deltaX,target.x_max-target.width));
    target.scrollY = Math.floor(uR.math.between(0,target.scrollY+e.deltaY,target.y_max-target.height));
    target.dirty = true;
    target.tick();
  }
  mousemove(e) {
    var target = e.target;
    target.imgX = e.offsetX+target.scrollX;
    target.imgY = e.offsetY+target.scrollY;
    target.mouseX = e.offsetX;
    target.mouseY = e.offsetY;
  }
  getEasing(t0) {
    return Math.max(0,this._ta - t0)/this._ta;
  }
}

uR.canvas.PaintObject = class PaintObject extends uR.canvas.CanvasObject {
  constructor(attrs={}) {
    super(attrs)
  }
  newCanvas(opts) {
    var canvas = super.newCanvas(opts);
    canvas.replaceColor = function(c1,c2) {
      var tc1 = tinycolor(c1);
      var tc2 = tinycolor(c2);
      var image_data = canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);
      var _id = image_data.data;
      for (var i=0;i<_id.length;i+=4) {
        if (_id[i] == tc1._r && _id[i+1] == tc1._g && _id[i+2] == tc1._b) {
          _id[i] = tc2._r;
          _id[i+1] = tc2._g;
          _id[i+2] = tc2._b;
          _id[i+3] = tc2._a;
        }
      }
      canvas.ctx.putImageData(image_data,0,0);
    }
    return canvas;
  }
  loadImage(src,callback) {
    var img = uR.newElement('img',{
      src:src,
      onload: callback,
    });
  }
}
