uR.config.tag_templates.push("checkbox-input");

<checkbox-input>
  <div each={ choices } class="choice">
    <input type="checkbox" id="{ id }" value={ value } name={ name } onchange={ update } />
    <label for="{ id }">{ label }</label>
  </div>

  var self = this;
  this.on("mount",function() {
    var _choices = uR.form.parseChoices(this.parent.choices);
    this.choices = _choices.map(function(choice_tuple,index) {
      return {
        name: self.parent._name,
        label: choice_tuple[1],
        id: "checkbox_"+self.parent._name+"_"+index,
        value: uR.slugify(choice_tuple[0]),
      }
    });
    this.update();
    if (this.parent.initial_value) {
      var initial = this.parent.initial_value;
      if (typeof initial == "string") { initial = initial.split(",") }
      uR.forEach(initial,function(slug) {
        var cb = self.root.querySelector("[value="+slug+"]");
        if (cb) { cb.checked = true }
      })
      this.update();
    }
    this._is_mounted = true;
  });
  this.on("update",function() {
    var out = [];
    uR.forEach(this.root.querySelectorAll("[type=checkbox]"),function(c) {
      c.checked && out.push(c.value);
    });
    this.setValue(out.join(","));
  });
</checkbox-input>
