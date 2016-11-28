var DialogMixin = {
  init: function() {
    if (this.opts.ur_modal){
      this.theme = this.opts.theme || uR.theme.modal;
      var e = document.createElement('div');
      e.addEventListener("click",(function() { this.unmount() }).bind(this));
      e.setAttribute("ur-mask",true);
      if (this.root.childNodes.length) {
        this.root.insertBefore(e,this.root.childNodes[0])
      } else {
        this.root.appendChild(e);
      }
    }
  }
}

riot.mixin(DialogMixin)
