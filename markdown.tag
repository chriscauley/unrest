<markdown><yield/>
  this.on("mount",function() {
    this.root.innerHTML = markdown.toHTML(this.root.innerHTML);
  });
</markdown>
