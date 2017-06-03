uR.mount_tabs = true;
uR.ready(function() {
  if (uR._mount_tabs) { riot.mount("ur-tabs"); }
});
<ur-tabs>
  <div class="tab-anchors">
    <a onclick={ showTab } each={ tab,i in tabs } class={ active: i == this.active }> { tab.title }</a>
  </div>
  <yield />

  <style scoped>
    :scope.default .tab-anchors a {
      color: inherit;
      cursor: pointer;
      display: inline-block;
      padding: 5px;
      border: 1px solid;
    }
    :scope.default .tab-anchors a.active {
      text-decoration: underline;
    }
  </style>
  showTab(e) {
    this.active = e.item.i;
  }

  this.on("mount",function() {
    // this['ur-tabs'].tab will be a single riot tag or an array. we want an array
    this.tabs = this.tags['ur-tab'];
    if (this.tabs && !this.tabs[0]) { this.tabs = [this.tabs] }
    uR.forEach(this.tabs,function(tab,i) { tab.index = i; });
    this.active = 0;
    if (uR.config.default_tabs) { this.root.classList.add("default");}
    this.update();
  });
</ur-tabs>

<ur-tab>
  <yield/>

  <style scoped>
    ur-tabs.default :scope {
      border: 1px solid;
      box-sizing: border-box;
      height: 400px;
      max-width: 100%;
      overflow-y: auto;
      padding: 5px;
      width: 650px;
    }
    :scope { display: block; }
    :scope.hidden { display: none; }
  </style>

  this.title = this.opts.title;

  show() {
    this.root.classList.remove("hidden");
    if (this.loaded) { return }
    if (this.opts.href) {
      this.ajax({
        url: this.opts.href,
        success: function(data,response) { this.root.innerHTML = data.content || response.response; this.loaded = true; }
      });
    }
    this.opts.click && this.opts.click();
  }

  hide() { 
    this.root.classList.add("hidden");
  }

  this.on("update",function() {
    if (this.parent.active == undefined) { return }
    (this.parent.active == this.index?this.show:this.hide)();
  });
</ur-tab>
