(function() {
  uR.config.input_overrides.checkbox = uR.config.input_overrides["checkbox-input"] = "checkbox-input";
  uR.config.input_overrides.radio = uR.config.input_overrides["radio-input"] = "checkbox-input";
  uR.form.fields['checkbox-input'] = class CheckboxInput extends uR.form.URInput {
    constructor(form,options) {
      super(form,options)
      if (this.type == "checkbox-input") { this.type = "checkbox"; }
      this.initial = this.initial_value;
      if (typeof this.initial == "string") { this.initial = this.initial.split(",") }
      this.last_value = this.initial;
      if (!(this.choices && this.choices.length)) {
        this.choices = [{
          label: this.label,
          id: this.id+"__"+0,
          value: "true",
        }];
        this.className += " no-label";
      }
    }
    reset() {
      this.show_error = false;
      this.value = this.initial || [];
      var target;
      uR.forEach(this.value,function(slug) {
        var cb = this.field_tag.root.querySelector("[value="+slug+"]");
        if (cb) { cb.checked = true; target = cb; }
      }.bind(this));
      this.onKeyUp({target:target});
      this.field_tag.update();
    }
    onKeyUp(e) {
      this.changed = false;
      this.valid = true;
      this.value = [];
      this.last_value = this.last_value || [];
      if (!Array.isArray(this.last_value)) { this.last_value = [this.last_value] }
      uR.forEach(this.field_tag.root.querySelectorAll('[name="'+this.name+'"]'),function(input) {
        this.changed = this.changed || ((this.last_value.indexOf(input.value) != -1) !== input.checked);
        if (input.checked) { this.value.push(input.value); }
      }.bind(this));
      if (this.required && !this.value.length) {
        this.data_error = "This field is required.";
        this.valid = this.value.length;
      }
      this.show_error = true;
      this.last_value = this.value;
      this.form.form_tag.update();
      this.form.form_tag.onChange();
    }
  }
})();

<checkbox-input>
  <div each={ _c, i in field.choices } class="choice">
    <input type={ field.type } id={ _c.id } value={ _c.value } onchange={ onKeyUp } onBlur={ onKeyUp }
           name={ field.name } />
    <label for={ _c.id }>{ _c.label }</label>
  </div>

<script>
  this.on("before-mount",function() {
    var self = this;
    this.opts.field.field_tag = this;
  });
  onKeyUp(e) {
    this.field.onKeyUp(e)
  }
</script>
</checkbox-input>
