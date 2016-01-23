<ur-tabs>
  <div class="tab-anchors">
    <a onclick={ showTab } each={ tabs }> { id }</a>
  </div>
  <yield />

  showTab(e) {
    this.active_id = e.item.id;
  }

  this.on("mount",function() {
    // this.tags.tab will be a single riot tag or an array. we want an array
    console.log(this.tags);
    this.tabs = this.tags['ur-tab'];
    if (this.tabs && !this.tabs[0]) { this.tabs = [this.tabs] }
    this.active_id = this.tabs[0].id;
    this.update();
  });
</ur-tabs>

<ur-tab>
  <yield/>

  <style scoped>
    :scope.hidden { display: none; }
  </style>

  this.id = opts.id;
  this.on("update",function() {
    this.root.className = (this.opts.id == this.parent.active_id)?"":"hidden";
  });
</ur-tab>
