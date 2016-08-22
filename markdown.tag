<markdown><yield/>
  this.on("mount",function() {
    var content = this.opts.content || this.root.innerHTML;
    this.root.innerHTML = markdown.toHTML(content.replace("&amp;","&"));
  });
</markdown>
