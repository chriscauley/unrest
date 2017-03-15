(function() {
  uR.config.input_overrides.select = uR.config.input_overrides["select-input"] = "select-input";
  uR.form.fields['select-input'] = class SelectInput extends uR.form.URInput {
    constructor(form,options) {
      options.input_tagname = "select";
      super(form,options)
    }
  }
})();

<select-input>
  <select id={ field.id } onchange={ onChange } onblur={ onBlur } class="browser-default" name={ field.name }>
    <option each={ field.choices } value={ value }>{ label }</option>
  </select>

  onBlur(e) { this.field.onBlur(e) }
  onChange(e) { this.field.onChange(e) }

  this.on("mount",function() {
    this.update();
  });
</select-input>
