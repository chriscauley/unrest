(function() {
  var test_count = 0;
  uR.test = {
    setPath: function setPath(pathname,hash) { // broke
      return uR.test.watch(function () {
        hash = hash || "#";
        if (pathname != window.location.pathname ||
            hash != window.location.has) {
          window.location = pathname + (hash || "#");
        }
        return true;
      });
    },
    wait: function wait(ms,s) {
      return function() {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            konsole.log('waited',ms,s);
            resolve();
          }, ms);
        });
      }
    },

    when: function when(funcs,ms,max_ms) {
      // we can take an array or a function
      if (typeof funcs == "function") { funcs = [funcs] }
      return function() {
        return new Promise(function (resolve, reject) {
          var start = new Date();
          var interval = setInterval(function () {
            uR.forEach(funcs,function(f) {
              var out = f();
              if (out) {
                konsole.log('when '+f.name);
                resolve(out);
                clearInterval(interval)
              }
            });
            if (new Date() - start > max_ms) {
              konsole.log("rejected ",new Date() - start)
              //reject(new Date() - start)
              clearInterval(interval)
            }
          }, ms);
        });
      }
    },

    watch: function watch(f,opts) {
      opts = opts || {};
      var max_ms = opts.max_ms || uC.config.max_ms;
      var interval_ms = opts.interval_ms || uC.config.interval_ms;
      var name = opts.name || f.name;
      var start = new Date(),
          interval;
      return function() {
        return new Promise(function(resolve,reject) {
          interval = setInterval(function() {
            var out = f(),
                ms_since = (new Date()-start);
            var time_since = ms_since+"/"+max_ms;
            konsole.watch(name,time_since);
            if (out) {
              clearInterval(interval);
              konsole.log(test_count,name,"resolved@",time_since);
              test_count ++;
              resolve(out);
            } else if (ms_since > max_ms) {
              clearInterval(interval);
              konsole.watch(name,"FAILED "+time_since);
              reject(out);
            }
          }, interval_ms);
        });
      }
    },
    is: function exists(f) {
      return uR.test.watch(f).then(
        function() { konsole.log("test pass: "+f.name) },
        function() { konsole.log("test fail: "+f.name) }
      )
    },
    watchFor: function watchFor(querySelector) {
      var f = function() { return document.querySelector(querySelector) }
      return function() { return uR.test.watch(f,{name: "watchFor "+querySelector}); }
    },
    click: function click(querySelector) {
      return function(resolve,reject) {
        document.querySelector(querySelector).click();
        konsole.log(test_count,"clicked "+querySelector);
        test_count += 1;
      }
    },
    changeValue: function changeValue(querySelector,value) {
      return function(resolve,reject) {
        var e = document.querySelector(querySelector);
        e.value = value;
        e.dispatchEvent(new Event("change"));
        konsole.log("changed "+querySelector);
      };
    },
    Test: class Test {
      constructor() {
        this.promise = Promise.resolve(function() { return true });
      }
      click(qS) {
        this.promise = this.promise.then(uR.test.click(qS));
        return this;
      }
      changeValue(qS,value) {
        this.promise = this.promise.then(uR.test.changeValue(qS,value));
        return this;
      }
    }
  }
})();
