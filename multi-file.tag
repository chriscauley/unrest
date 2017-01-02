uR.config.tag_templates.push("multi-file");
uR.config.tmp_file_url = "/media_files/private/";

<multi-file>
  <form action={ action } method="POST" if={ can_upload }>
    <label class={ uR.config.btn_primary }>
      <input type="file" onchange={ validateAndUpload } style="display:none;" name="file" />
      { opts.parent.upload_text || 'Upload another file' }
    </label>
  </form>
  <div each={ files } class="file { uR.config.alert_success }">
    <div>
      <div class="name">{ name }</div>
      <div class="content_type">{ content_type }</div>
    </div>
    <div onclick={ parent.deleteFile } class="fa fa-trash"></div>
  </div>
  <div if={ error_msg } class={ uR.theme.error_class }>{ error_msg }</div>

  this.parent = this.opts.parent;
  var self = this;
  validateAndUpload(e) {
    var form = this.root.querySelector("form");
    this.error_msg = undefined;
    uR.ajax({
      form: form,
      success: function(data) {
        this.files.push(data);
        uR.storage.set(this.action+"__files",this.files);
      },
      error: function(data) {
        self.error_msg = "An unknown error has occurred.";
      },
      that: this,
    });
    this.root.querySelector("[type=file]").value = "";
  }
  deleteFile(e) {
    uR.forEach(this.files,function(f,i) {
      if (f.id == e.item.id) { self.files.splice(i,1) }
    });
    uR.storage.set(this.action+"__files",this.files);
  }
  this.on("mount",function() {
    this.max_files = this.parent.max_files || Infinity;
    this.action = opts.action || uR.config.tmp_file_url;
    this.files = uR.storage.get(this.action+"__files") || [];
    this.update();
  });
  this.on("update",function() {
    this.setValue((this.files || []).map(function(f) { return f.id }).join(","));
    this.can_upload = !(this.files && this.files.length >= this.max_files);
  });
</multi-file>
