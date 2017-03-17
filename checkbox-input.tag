(function() {
  uR.config.input_overrides.checkbox = uR.config.input_overrides["checkbox-input"] = "checkbox-input";
  uR.config.input_overrides.radio = uR.config.input_overrides["radio-input"] = "checkbox-input";
  uR.form.fields['checkbox-input'] = class CheckboxInput extends uR.form.URInput {
    constructor(form,options) {
      super(form,options)
      this.initial = this.initial_value;
      if (typeof this.initial == "string") { this.initial = this.initial.split(",") }
      if (!this.choices) {
        this.choices = [["true",this.label]];
        this.form.form_tag.root.querySelector("[for="+this.id+"]").style.display = "none";
      }
    }
    reset() {
      this.show_error = false;
      this.value = this.initial || [];
      console.log(this.value)
      var target;
      uR.forEach(this.value,function(slug) {
        var cb = this.field_tag.root.querySelector("[value="+slug+"]");
        if (cb) { cb.checked = true; target = cb; }
      }.bind(this));
      this.onKeyUp({target:target});
      this.field_tag.update();
    }
    onKeyUp(e) {
      this.valid = true;
      this.value = []
      uR.forEach(this.field_tag.root.querySelectorAll("[name="+this.name+"]"),function(input) {
        if (input.checked) { this.value.push(input.value); }
      }.bind(this));
      if (this.required) {
        this.data_error = "This field is required.";
        this.valid = this.value.length;
      }
      this.show_error = true;
      this.form.form_tag.update()
    }
  }
})();

<checkbox-input>
  <div each={ field.choices } class="choice">
    <input type={ parent.field.type } id={ id } value={ value } onchange={ onKeyUp } onBlur={ onKeyUp }
           name={ parent.field.name } />
    <label for={ id }>{ label }</label>
  </div>

var self = this;
onKeyUp(e) {
  this.field.onKeyUp(e)
}
</checkbox-input>
