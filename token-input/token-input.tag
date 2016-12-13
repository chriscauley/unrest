uR.config.tag_templates.push("token-input");

<token-input>
  <input name={ _name } type="text" onfocus={ parent.onFocus } onblur={ parent.onBlur }>
  this.on("mount",function() {
    var initial = [];
    uR.forEach(this.opts.parent.initial_value || [], function(i) { initial.push({name:i,id:i}); });
    this._name = opts.parent._name;
    this.update();
    $(this.root).find("input").tokenInput(this.opts.parent.library,{
      preventDuplicates: true,
      prePopulate: initial,
      createNewItem: function(item,callback) {
        uR.ajax({
          url: "/api/board/tag/new/",
          data: {slug:item.value},
          method: 'POST',
          success: function(data) {
            callback(data);
          }
        })
      }
    })
    this.root.classList.add("active");
  });
</token-input>
