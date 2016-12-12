uR.config.tag_templates.push("checkbox-input");

<checkbox-input>
  <div each={ choices }>
    <input type="checkbox" id="{ id }" value={ value } name={ name } />
    <label for="{ id }">{ label }</label>
  </div>

  var self = this;
  this.on("mount",function() {
    this.choices = [];
    uR.forEach(this.opts.parent.verbose_choices,function(verbose,index) {
      self.choices.push({
        name: self.opts.parent._name,
        label: verbose,
        id: "checkbox_"+self.opts.parent._name+"_"+index,
        value: uR.slugify(verbose),
      });
    });
    this.update();
  });

</checkbox-input>
