uR.config.tag_templates.push("token-input");

<token-input>
  <input name={ _name } type="text" onfocus={ parent.onFocus } onblur={ parent.onBlur }>
  this.on("mount",function() {
    this._name = opts.parent._name;
  this.update();
    $(this.root).find("input").tokenInput(this.opts.parent.library,{
      preventDuplicates: true,
      createNewItem: function(item,callback) {
        uR.ajax({
          url: "/api/board/tag/new/",
          data: {name:item.value},
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
