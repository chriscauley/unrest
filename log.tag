<ur-logger>
  <div each={ line,lineno in _logs } data-lineno={ lineno } data-ms="{ line.ts }" class={ line.className }>
    <span each={ line }>
      <span onclick={ click } class="{ className } { pointer: click }" title={ title }>{ _name }</span>
    </span>
  </div>

  this.on("mount",function() {
    this.opts.logger.riot_tag = this;
  })
  this.on("update",function() {
    this._logs = this.opts.logger._logs;
  });
</ur-logger>

(function() {
  uR.__logs = [];
  uR.Log = function(opts) {
    opts = opts || {};
    function mount_then_update() {
      if (!opts.mount_to || log.riot_tag) { log.update_tag = log._update_tag }
      var element = document.querySelector(opts.mount_to);
      if (!element) { return }
      riot.mount(element,"ur-logger",{logger: log});
      log.update_tag = log._update_tag;
      log.update_tag();
    }
    function log() {
      // arguments can be strings or functions
      var args = [].slice.call(arguments);
      var set_line = (typeof args[0] == 'number')?args.shift():undefined;
      args = log._prepArguments(args);
      args.ts = log._getTimeStamp();
      log.last_log = new Date();
      if (set_line === undefined) {
        log._logs.push(args);
      } else {
        log._logs[set_line] = args;
      }
      log.update_tag();
    };
    var _icons = {
      "WARN": {className: "fa fa-warning",title: "WARNING"},
      "ERROR": {className: "fa fa-error",title: "ERROR"},
      "SUCCESS": {className: "fa fa-check",title: "SUCCESS"},
    }


    log._logs = (opts._logs || []).slice();
    log._name = opts.name || ("logger "+Math.random());
    log._getTimeStamp = function _getTimeStamp() {
      if (!log.last_log) { return "START" }
      var ts = (new Date().valueOf() - log.last_log.valueOf());
      if (ts > 1e5) { return "+"+(ts/1000).toFixed(0)+"s" }
      else if (ts > 1000) { return "+"+(ts/1000).toFixed(1)+"s" }
      else if (ts > 100) { return "+"+(ts/1000).toFixed(2)+"s" }
      return "+"+ts+"ms";
    }
    log.error = function error() {
      var args = [].slice.call(arguments);
      args.unshift("ERROR");
      log.apply(log,args);
      console.error.apply(window,args); // to get chrome's interactive stack trace
    }
    log.warn = function warn() {
      var args = [].slice.call(arguments);
      args.unshift("WARN");
      log.apply(log,args);
    }
    // log.clear = function() { log._last = undefined },
    log.watch = function watch(k,v) {
      if (watch_keys.indexOf(k) == -1) { watch_keys.push(k); }
      watch_ings[k] = v;
      log.update_tag();
    }
    log._update_tag = function update_tag() {
      log.riot_tag && log.riot_tag.update && log.riot_tag.update();
    }
    log.update_tag = mount_then_update;
    log._prepArguments = function _prepArguments(args) {
      var className = "";
      if (_icons[args[0]]) {
        className = "k"+args[0].toLowerCase();
        args[0] = _icons[args[0]];
      }
      var out = args.map(function(word) {
        if (typeof word == "function") {
          return {
            className: "function",
            func: word,
            _name: word._name || word.name,
            click: function (e) {
              e.item.click = undefined;
              e.item._name = e.item.func() || e.item._name;
              log.update_tag();
            },
          }
        } else if (typeof word == "string") {
          var new_word = {
            content: word,
            title: word.title,
            _name: word
          }
          if (args.length > 1) { new_word._name = (word.length < 30)?word:word.slice(0,15)+"..."; }
          if (word.startsWith("data:image")) {
            new_word.className = "dataURL";
            new_word._name = "dataURL";
            new_word.click = function() { window.open(word); }
          }
          try {
            if (document.querySelector(word)) {
              new_word.className = "element";
              new_word._name = document.querySelector(word).tagName;
              new_word.title = word;
            }
          } catch(e) { }
          return new_word;
        } else if (word === undefined) {
          return { className: "undefined", _name: "undefined" }
        } else if (Array.isArray(word)) {
          return { className: "array", _name: JSON.stringify(word) }
        }
        return word; // it was something else, hopefully pre-formatted
      });
      out.className = className;
      return out;
    }
    if (opts.parent) {
      opts.parent.log = log;
      uR.forEach(['warn','error'], function(s) { opts.parent[s] = log[s]; })
    }

    uR.__logs.push(log);
    return log
  }
})();
