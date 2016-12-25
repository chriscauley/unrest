uR.config.tag_templates.push("checkbox-input");

<checkbox-input>
  <div each={ choices } class="choice">
    <input type="checkbox" id="{ id }" value={ value } name={ name } />
    <label for="{ id }">{ label }</label>
  </div>

  var self = this;
  this.on("mount",function() {
    var _choices = uR.form.parseChoices(this.opts.parent.choices);
    this.choices = _choices.map(function(choice_tuple,index) {
      return {
        name: self.opts.parent._name,
        label: choice_tuple[1],
        id: "checkbox_"+self.opts.parent._name+"_"+index,
        value: uR.slugify(choice_tuple[0]),
      }
    });
    this.update();
  });

</checkbox-input>
