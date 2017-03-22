uR.config.input_overrides['multi-file'] = uR.config.input_overrides["multi-file"] = "multi-file";
uR.config.tmp_file_url = "/media_files/private/";
uR.form.fields['multi-file'] = class MultiFileInput extends uR.form.URInput {
  constructor(form,options) {
    super(form,options)
  }
}

<multi-file>
  <form action={ action } method="POST" if={ can_upload }>
    <label class={ uR.config.btn_primary }>
      <input type="file" onchange={ validateAndUpload } style="display:none;" name="file" />
      { upload_text }
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

  var self = this;
  validateAndUpload(e) {
    var form = this.root.querySelector("form");
    this.error_msg = undefined;
    this.ajax({
      form: form,
      success: function(data) {
        this.files.push(data);
        uR.storage.set(this.action+"__files",this.files);
      },
      error: function(data) {
        self.error_msg = "An unknown error has occurred.";
      },
    });
    this.root.querySelector("[type=file]").value = "";
  }
  clear() {
    this.value = "";
    this.files = [];
    uR.storage.set(this.action+"__files",undefined);
    this.update();
  }
  deleteFile(e) {
    uR.forEach(this.files,function(f,i) {
      if (f.id == e.item.id) { self.files.splice(i,1) }
    });
    uR.storage.set(this.action+"__files",this.files);
  }
  this.on("mount",function() {
    this.max_files = this.field.max_files || Infinity;
    this.action = opts.action || uR.config.tmp_file_url;
    this.files = uR.storage.get(this.action+"__files") || [];
    this.update();
  });
  this.on("update",function() {
    if (this.files && this.files.length) {
      this.upload_text = opts.parent.upload_another_text || opts.parent.upload_text || "Upload another file";
      this.field.value = (this.files).map(function(f) { return f.id }).join(",");
    } else {
      this.upload_text = this.field.upload_text || 'Upload a file';
      this.value = "";
    }
    this.can_upload = !(this.files && this.files.length >= this.max_files);
  });
</multi-file>
