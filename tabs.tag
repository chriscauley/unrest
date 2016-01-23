<ur-tabs>
  <div class="tab-anchors">
    <a onclick={ showTab } each={ tabs } class={ active: id == parent.active_id }> { id }</a>
  </div>
  <yield />

  <style scoped>
    :scope .tab-anchors a {
      display: inline-block;
      padding: 5px;
      border: 1px solid;
    }
    :scope .tab-anchors a.active {
      box-shadow: inset 0 0 10px;
      text-decoration: underline;
    }
  </style>
  showTab(e) {
    this.active_id = e.item.id;
  }

  this.on("mount",function() {
    // this['ur-tabs'].tab will be a single riot tag or an array. we want an array
    this.tabs = this.tags['ur-tab'];
    if (this.tabs && !this.tabs[0]) { this.tabs = [this.tabs] }
    this.active_id = this.tabs[0].id;
    this.update();
  });
</ur-tabs>

<ur-tab>
  <yield/>

  <style scoped>
    :scope {
      border: 1px solid;
      box-shadow: inset 0 0 20px;
      box-sizing: border-box;
      display: block;
      height: 400px;
      overflow-y: auto;
      padding: 20px;
      width: 500px;
    }
    :scope.hidden { display: none; }
  </style>

  this.id = opts.id;
  this.on("update",function() {
    this.root.className = (this.opts.id == this.parent.active_id)?"":"hidden";
  });
</ur-tab>
