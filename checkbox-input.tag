(function() {
  uR.config.input_overrides.checkbox = uR.config.input_overrides["checkbox-input"] = "checkbox-input";
  uR.config.input_overrides.radio = uR.config.input_overrides["radio-input"] = "checkbox-input";
  uR.form.fields['checkbox-input'] = class CheckboxInput extends uR.form.URInput {
    constructor(form,options) {
      super(form,options)
    }
  }
})();

<checkbox-input>
  <div each={ field.choices } class="choice">
    <input type={ parent.field.type } id={ id } value={ value } onchange={ update } name={ parent._name } />
    <label for={ id }>{ label }</label>
  </div>

  var self = this;
  this.on("mount",function() {
    if (this.field.initial_value) {
      var initial = this.parent.initial_value;
      if (typeof initial == "string") { initial = initial.split(",") }
      uR.forEach(initial,function(slug) {
        var cb = self.root.querySelector("[value="+slug+"]");
        if (cb) { cb.checked = true }
      });
      this.update();
    }
    this._is_mounted = true;
    this.update();
  });
  this.on("update",function() {
    var out = [];
    uR.forEach(this.root.querySelectorAll("[type=checkbox]"),function(c) {
      c.checked && out.push(c.value);
    });
    this.field.value = out;
  });
</checkbox-input>
