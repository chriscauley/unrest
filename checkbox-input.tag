uR.config.tag_templates.push("checkbox-input");

<checkbox-input>
  <div each={ choices } class="choice">
    <input type="checkbox" id="{ id }" value={ value } onchange={ update } />
    <label for="{ id }">{ label }</label>
  </div>

  var self = this;
  this.on("mount",function() {
    if (this.parent.initial_value) {
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
    this.setValue(out.join(","));
  });
</checkbox-input>
