uR.config.tag_templates.push("multi-file");

<multi-file>
  <form action={ action } method="POST">
    <label class="btn btn-primary">
      <input type="file" onchange={ validateAndUpload } style="display:none;" name="file" />
      Upload another file
    </label>
  </form>
  <div each={ files } class="file { uR.config.alert_success }">
    <div>
      <div class="name">{ name }</div>
      <div class="content_type">{ content_type }</div>
    </div>
    <div onclick={ parent.deleteFile } class="fa fa-trash"></div>
  </div>
    

  this.parent = this.opts.parent;
  var self = this;
  validateAndUpload(e) {
    var form = this.root.querySelector("form");
    uR.ajax({
      form: form,
      success: function(data) {
        this.files.push(data);
        uR.storage.set(this.action+"__files",this.files);
      },
      that: this,
    });
    this.root.querySelector("[type=file]").value = undefined;
  }
  deleteFile(e) {
    uR.forEach(this.files,function(f,i) {
      if (f.id == e.item.id) { self.files.splice(i,1) }
    });
    uR.storage.set(this.action+"__files",this.files);
  }
  this.on("mount",function() {
    this.action = opts.action || uR.config.tmp_file_url;
    this.files = uR.storage.get(this.action+"__files") || [];
    this.update();
  });
  this.on("update",function() {
    this.setValue((this.files || []).map(function(f) { return f.id }).join(","));
  });
</multi-file>
