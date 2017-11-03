(function() {
  uR.Log = function(opts) {
    opts = opts || {};
    var self = {
      _logs: (opts._logs || []).slice(),
      log: function log() {
        // arguments can be strings or functions
        var a = [].slice.call(arguments);
        if (self.last_log) {
          var ts = (new Date().valueOf() - self.last_log.valueOf());
          if (ts > 1e5) { ts = "+"+(ts/1000).toFixed(0)+"s" }
          else if (ts > 1000) { ts = "+"+(ts/1000).toFixed(1)+"s" }
          else if (ts > 100) { ts = "+"+(ts/1000).toFixed(2)+"s" }
          else { ts = "+"+ts+"ms" }
        } else {
          var ts = 'START';
        }
        self.last_log = new Date();
        var className = "";
        if (a[0] == "WARN") {
          a[0] = {className: "fa fa-warning",title: "WARNING"};
          className = "kwarning";
        }
        if (a[0] == "ERROR") {
          a[0] = {className: "fa fa-error",title: "ERROR"};
          className = "kerror";
        }
        var out = a.map(function(word) {
          if (typeof word == "function") {
            return {
              className: "function",
              func: word,
              _name: word._name || word.name,
              click: function (e) {
                e.item.click = undefined;
                e.item._name = e.item.func() || e.item._name;
                konsole.update();
              },
            }
          } else if (typeof word == "string") {
            var new_word = {
              content: word,
              _name: (word.length < 30)?word:word.slice(0,15)+"...",
            }
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
          }
          return word; // it was something else, hopefully pre-formatted
        });
        out.ts = ts;
        out.className = className;
        self._logs.push(out);
        self.update();
      },
      error: function error() {
        var args = [].slice.call(arguments);
        args.unshift("ERROR");
        konsole.log.apply(konsole,args);
        console.error.apply(window,args); // to get chrome's interactive stack trace
      },
      warn: function() {
        var args = [].slice.call(arguments);
        args.unshift("WARN");
        konsole.log.apply(konsole,args);
      },
      clear: function() { konsole.log._last = undefined },
      watch: function(k,v) {
        if (watch_keys.indexOf(k) == -1) { watch_keys.push(k); }
        watch_ings[k] = v;
        self.update();
      }
    }
    if (opts.parent) {
      for (var key in self) {
        opts.parent[key] = self[key];
      }
    }

    // this is just to hook it back into a riot tag if there is one. May need to be more complex later.
    self.update = opts.update || (opts.parent && opts.parent.update) || function() {};
    return self;
  }
})();
