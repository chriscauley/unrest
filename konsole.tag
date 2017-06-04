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
    <ur-tab title="Run">
      <div each="{ command in uR.config.commands }">
        <button class="btn { command.ur_status }" onclick={ command }>{ command.name }</button>
      </div>
    </ur-tab>
    <ur-tab title="Logs">
      <div each="{ parent.parent.log }">
        { text }
        <button each={ action in actions } onclick={ action }>{ action.name }</button>
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
  console.log(uR.config.commands);
  //uR.commands = [function What() {console.log("wow");}]

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
      log: function(text) {
        // konsole.log(text, actionOne, actionTwo...)
        var out = { text: text, actions: [] };
        uR.forEach(arguments,function(func,i) {
          // skip argument[0] == text
          if (i > 0) { out.actions.push(func) }
        });
        that.log.push(out);
        that.update();
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
