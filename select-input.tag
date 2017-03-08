(function() {
  uR.config.input_overrides.select = uR.config.input_overrides["select-input"] = "select-input";
  uR.form.fields['select-input'] = class SelectInput extends uR.form.URInput {
    constructor(form,options) {
      super(form,options)
    }
  }
})();

<select-input>
  <div>wewt</div>


</select-input>
