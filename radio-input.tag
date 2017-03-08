// DEPRACATED: This is being merged with checkbox input and is currently unused.

uR.config.input_overrides.checkbox = "radio-input";
uR.config.input_overrides["radio-input"] = "radio-input";

<radio-input>
  <div each={ choices } class="choice">
    <input type="radio" id={ id } value={ value } onchange={ update } name={ _name }/>
    <label for={ id }>{ label }</label>
  </div>

  this.on("mount",function() {
    this.update()
  });
  this.on("update",function() {
    this.setValue((this.root.querySelector(":checked") || {}).value);
  });
</radio-input>
