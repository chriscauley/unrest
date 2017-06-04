(function()  {
  window.konsole = {
    _ready: [],
    _start: function() {
      var k = document.body.appendChild(document.createElement("konsole"));
      riot.mount("konsole");
    }
  };
  uR.forEach(['log','warn','error','watch'],function(key) {
    konsole[key] = function() {
      konsole._ready.push([key,arguments]);
      konsole._start();
      konsole._start = function(){}
    }
  });
  uR._mount_tabs = false;
})();

<konsole>
  <ur-tabs>
    <ur-tab title="Logs">
      <div each="{ parent.parent.log }">
        { text }
      </div>
    </ur-tab>
    <ur-tab title="Watches">
      <div each="{ parent.parent.watch }">
        <b>{ key }:</b> { value }
      </div>
    </ur-tab>
  </ur-tabs>

  var watch_keys = [];
  var watch_ings = {};
  this.log = [];
  var that = this;

  this.on('update',function() {
    this.watch = [];
    for (var i=0;i<watch_keys.length;i++) {
      var k = watch_keys[i];
      this.watch.push({key: k, value: watch_ings[k]});
    }
  });
  toggle(e) {
    this.active = !this.active;
  }
  this.on("mount",function() {
    window.konsole = {
      log: function() {
        var v = [].slice.apply(arguments).join(" ");
        that.log.push({ text:v }); that.update();
      },
      watch: function(k,v) {
        if (watch_keys.indexOf(k) == -1) { watch_keys.push(k); }
        watch_ings[k] = v;
        that.update();
      },
      _ready: konsole._ready,
    };
    uR.forEach(konsole._ready,function(tup) {
      var key = tup[0], args = tup[1];
      konsole[key].apply(this,[].slice.apply(args));
    });
  });
</konsole>
