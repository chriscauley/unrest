<ur-include>
  this.on("mount", function() {
    if (!this.opts.type) { return };
    var e = document.createElement(this.type);
    this.root.appendChild(e);
    riot.mount(this.type,e,this.opts);
  });
</ur-include>
