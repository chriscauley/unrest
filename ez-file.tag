<ez-file>
  <input type="file" id="{_id }" onchange={ cropIt } name={ slug } />
  <yield>
    <label if={ !done } for="{ _id }" class="btn-danger btn">{ opts.name }</label>
    <button if={ done } class="btn btn-success" onclick={ edIt }>Edit Headshot</button>
  </yield>
  <form action={ opts.url } method="POST">
    <input type="hidden" name="user_id" value={ opts.user_id } />
    <input type="hidden" name="blob" />
  </form>

  <style>
    ez-file { display: block; }
    ez-file input[type=file] { display: none; }
  </style>
  var self = this;
  this.on("mount", function() {
    this.slug = (this.opts.name || "").replace(" ","_").toLowerCase();
    this.done = this.opts.done;
    this._id = "file__"+this.slug+"__"+this.opts.user_id;
    this.update();
  });
  cropIt(e) {
    var filesToUpload = this.root.querySelector("[type=file]").files;
    var file = filesToUpload[0];

    var img = document.createElement("img");
    var reader = new FileReader();  
    reader.onload = function(e) {img.src = e.target.result}
    reader.readAsDataURL(file);

    img.onload = function() {
      uR.alertElement("resize-image",{ img: img, parent: self, });
    }
  }
  edIt(e) {
    img = document.createElement("img");
    img.onload = function() {
      uR.alertElement("resize-image",{ img: img, parent: self, });
    }
    img.src = this.done;
  }
  uploadFile(e) {
    var form = this.root.querySelector("form");
    this.ajax({
      url: this.opts.url,
      method: "POST",
      form: form,
      success: function(data) { this.done = data.done },
      error: function() { uR.alert("an unknown error has occurred. Go bug Chris!") }
    });
  }
</ez-file>
<resize-image>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <center>
        <canvas></canvas>
        <div class="burtons">
          <button onclick={ doZoom } class={ uR.config.btn_primary }>
            { zoom }x <i class="fa fa-search-plus"></i></button>
          <button onclick={ doRotate } class={ uR.config.btn_primary }><i class="fa fa-rotate-right"></i></button>
          <label for={ opts.parent._id } class={ uR.config.btn_success }><i class="fa fa-camera"></i></label>
        </div>
        <button onclick={ done } class={ uR.config.btn_success }>Save</button>
        <button onclick={ cancel } class={ uR.config.btn_cancel }>Cancel</button>
      </center>
    </div>
  </div>

  <style>
    resize-image .btn { font-size: 1.5em; margin: 0 5px; }
    resize-image .burtons .btn { margin-bottom: 10px; }
  </style>

  this.on("mount",function() {
    this.canvas = this.root.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.img = this.opts.img;
    this.ratio = this.img.width/this.img.height;
    var max_width = this.canvas.parentElement.clientWidth;
    this.canvas.width = max_width;
    this.canvas.height = max_width/this.ratio;
    this.zoom = 1;
    this.rotate = 0;
    this.file = this.opts.parent.root.querySelector("[type=file]");
    this.blob = this.opts.parent.root.querySelector("[name=blob]");
    this.file.value = "";
    this.blob.value = "";
    this.update();
  });
  this.on("update",function() {
    if (!this.img) { return }
    var canvas = this.canvas;
    var dx = (this.zoom-1)*canvas.width;
    var dy = (this.zoom-1)*canvas.height;
    this.ctx.clearRect(0,0,canvas.width,canvas.height);
    this.ctx.drawImage(this.opts.img,-dx,-dy,canvas.width+2*dx,canvas.height+2*dy)

    var img = document.createElement('img'); // create a Image Element
    img.src = canvas.toDataURL("image/png"); // cache the image data source
    this.ctx.clearRect(0,0,canvas.width,canvas.height);
    this.ctx.save();
    this.ctx.translate(canvas.width/2,canvas.height/2);
    this.ctx.rotate(this.rotate*Math.PI);
    this.ctx.drawImage(img,-canvas.width/2,-canvas.height/2);
    this.ctx.restore();
  });
  cancel(e) {
    this.unmount();
  }
  doZoom(e) {
    this.zoom += 0.5;
    if (this.zoom > 3) { this.zoom = 1; }
  }
  doRotate(e) {
    this.rotate += 0.5;
  }
  done(e) {
    this.blob.value = this.canvas.toDataURL();
    this.opts.parent.uploadFile();
    this.unmount();
  }
</resize-image>
