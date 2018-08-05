// #! TODO retest this. Haven't used it in several versions of riot
<image-input>
  <img if={ initial_value } riot-src={ initial_value } />
  <input type="file" name="{ name }" onchange={ onChange }/>
  this.on("mount", function() {
    this.name = this.opts.parent._name;
    this.update();
  });
  onChange(e) {
    var files = e.target.files;
    this.opts.form.onChange(e);
  }
</image-input>