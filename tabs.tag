<ur-tabs>
  <div class="tab-anchors">
    <a onclick={ showTab } each={ tabs } class={ active: title == parent.active_title }> { title }</a>
  </div>
  <yield />

  <style scoped>
    :scope .tab-anchors a {
      cursor: pointer;
      display: inline-block;
      padding: 5px;
      border: 1px solid;
    }
    :scope .tab-anchors a.active {
      text-decoration: underline;
    }
  </style>
  showTab(e) {
    this.active_title = e.item.title;
  }

  this.on("mount",function() {
    // this['ur-tabs'].tab will be a single riot tag or an array. we want an array
    this.tabs = this.tags['ur-tab'];
    if (this.tabs && !this.tabs[0]) { this.tabs = [this.tabs] }
    this.active_title = this.tabs[0].title;
    this.update();
  });
</ur-tabs>

<ur-tab>
  <yield/>

  <style scoped>
    :scope {
      border: 1px solid;
      box-sizing: border-box;
      display: block;
      height: 400px;
      max-width: 100%;
      overflow-y: auto;
      padding: 5px;
      width: 650px;
    }
    :scope.hidden { display: none; }
  </style>

  this.title = opts.title;
  this.on("update",function() {
    this.root.className = (this.opts.title == this.parent.active_title)?"":"hidden";
  });
</ur-tab>
