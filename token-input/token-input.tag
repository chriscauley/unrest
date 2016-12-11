<token-input>
  <input name={ _name } type="text" onfocus={ parent.onFocus } onblur={ parent.onBlur }>
  this.on("mount",function() {
    $(this.root).find("input").tokenInput(this.opts.library);
    this.root.classList.add("active");
  });
</token-input>
