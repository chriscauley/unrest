uR.config.tag_templates.push("token-input");

<token-input>
  <input name={ _name } type="text" onfocus={ parent.onFocus } onblur={ parent.onBlur }>

  var self = this;
  this.on("mount",function() {
    var initial = [];
    uR.forEach(parent.initial_value || [], function(i) { initial.push({name:i,id:i}); });
    this._name = opts.parent._name;
    this.update();
    $(this.root).find("input").tokenInput(parent.library,{
      preventDuplicates: true,
      prePopulate: initial,
      onAdd: onKeyUp,
      onDelete: onKeyUp,
      createNewItem: function(item,callback) {
        uR.ajax({
          url: "/api/board/tag/new/",
          data: {slug:item.value},
          method: 'POST',
          success: function(data) { callback(data); }
        })
      }
    })
    this.root.classList.add("active");
  });

  // most of the below will someday be a mixin
  var parent = self.opts.parent;
  function onKeyUp() {
    var target = self.root.querySelector("[name="+self._name+"]");
    if (parent.parent) { parent.parent.active = true; }
    parent.onBlur({target: target,type: "blur"}); // blur triggers validation
    triggerValidation();
  }
  var class_map = {
    empty: 'empty',
    invalid: 'invalid',
    active: 'activated'
  }
  function triggerValidation() {
    parent.update();
    for (var c in class_map) {
      if (parent[c]) { self.root.classList.add(class_map[c]) }
      else { self.root.classList.remove(class_map[c]) }
    }
  }
</token-input>
