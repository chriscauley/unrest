(function() {
  uR.config.input_overrides.checkbox = uR.config.input_overrides["checkbox-input"] = "checkbox-input";
  uR.config.input_overrides.radio = uR.config.input_overrides["radio-input"] = "checkbox-input";
  uR.form.fields['checkbox-input'] = class CheckboxInput extends uR.form.URInput {
    constructor(form,options) {
      super(form,options)
      this.initial = this.initial_value;
      if (typeof this.initial == "string") { this.initial = this.initial.split(",") }
    }
    reset() {
      this.show_error = false;
      this.value = this.initial_value || "";
      var target;
      uR.forEach(this.initial,function(slug) {
        var cb = this.field_tag.root.querySelector("[value="+slug+"]");
        if (cb) { cb.checked = true }
      }.bind(this));
      this.onKeyUp({target:target});
      this.activated = this.value != "";
      this.field_tag.update();
    }
  }
})();

<checkbox-input>
  <div each={ field.choices } class="choice">
    <input type={ parent.field.type } id={ id } value={ value } onchange={ update } name={ parent.field.name } />
    <label for={ id }>{ label }</label>
  </div>

  var self = this;
  this.on("update",function() {
    var out = [];
    uR.forEach(this.root.querySelectorAll("[type=checkbox]"),function(c) {
      c.checked && out.push(c.value);
    });
    this.field.value = out;
  });
</checkbox-input>
