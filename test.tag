(function() {
  uR.test = {
    setPath: function setPath(pathname,hash) {
      return uR.test.watch(function() {
        hash = hash || "#";
        if (pathname != window.location.pathname ||
            hash != window.location.has) {
          window.location = pathname + (hash || "#");
        }
        return true;
      });
    },
    watch: function watch(f,max_ms,interval_ms) {
      max_ms = max_ms || uC.config.max_ms;
      interval_ms = interval_ms || uC.config.interval_ms;
      var start = new Date(),
          interval;
      var promise = new Promise(function(resolve,reject) {
        interval = setInterval(function() {
          var out = f(),
              ms_since = (new Date()-start);
          if (out) {
            clearInterval(interval);
            resolve(out);
          } else if (ms_since > max_ms) {
            clearInterval(interval);
            console.error("promise not resolved after "+max_ms+" seconds");
            reject(out);
          }
        }, interval_ms);
      });
      return promise
    },
    watchFor: function watchFor(querySelector) {
      return uR.test.watch(function() { return document.querySelector(querySelector) });
    },
    click: function click(querySelector) {
      document.querySelector(querySelector).click();
    },
    changeValue: function changeValue(querySelector,value) {
      return uR.test.watchFor(querySelector).then(function() {
        var e = document.querySelector(querySelector);
        e.value = value;
        e.dispatchEvent(new Event("change"));
      });
    },
    Test: function Test(path,action_sets) {
      var promise = uR.test.setPath("/");
      uR.forEach(action_sets,function(action_set) {
        uR.forEach(action_set(),function(action) {
          promise = promise.then(action);
        });
        promise = promise.catch(function() { konsole.log("FAIL: '"+action_set.name+'"')});
        promise = promise.then(function() { konsole.log('PASS: "'+action_set.name+'"')});
      });
    }
  }
})();
