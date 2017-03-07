uR.config.tag_templates.push("radio-input");

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
