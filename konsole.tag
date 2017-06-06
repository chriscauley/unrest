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
      <div each={ command in uR.config.commands }>
        <button class="btn { command.ur_status }" onclick={ command }>{ command.name }</button>
      </div>
    </ur-tab>
    <ur-tab title="Logs">
      <div each={ line in parent.parent.log }>
        <span each={ word in line }>
          <a href="javascript:void()" if={ typeof(word) === 'function' } onclick={ word }></a>
          <u if={ typeof(word) !== 'function' }>{ word }</u>
        </span>
      </div>
    </ur-tab>
    <ur-tab title="Watches">
      <div each={ parent.parent.watch }>
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
        // arguments can be strings or functions
        that.log.push([].slice.call(arguments).concat([new Date() - (konsole.log._last || new Date())]))
        that.update();
        konsole.log._last = new Date();
      },
      update: that.update,
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
    setTimeout(konsole.update,500);
  });
</konsole>
