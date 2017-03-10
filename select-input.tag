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
  <select id={ field.id } onchange={ field.onChange } onblur={ field.onBlur } class="browser-default">
    <option each={ field.choices } value={ value }>{ label }</option>
  </select>

  this.on("mount",function() {
    this.update();
  });
</select-input>
