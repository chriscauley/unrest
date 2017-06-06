(function() {
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
      var func_names = funcs.map((f) => f.name||"(anon)").join("|");
      ms = ms || 20; // how often to check
      max_ms = max_ms || 5000; // how long before fail
      return function() {
        return new Promise(function (resolve, reject) {
          var start = new Date();
          var interval = setInterval(function () {
            if (new Date() - start > max_ms) {
              konsole.log("rejected ",new Date() - start)
              clearInterval(interval)
              return reject("["+func_names+"] failed at "+max_ms);
            }
            uR.forEach(funcs,function(f) {
              var out = f();
              if (out) {
                konsole.log('when '+f.name);
                resolve(out);
                clearInterval(interval)
              }
            });
          }, ms);
        });
      }
    },

    waitFor: function waitFor(qS,ms,max_ms) {
      ms = ms || 100;
      max_ms = max_ms || 1500;
      return uR.test.when(function (){ return document.querySelector(qS) },ms,max_ms);
    },

    watch: function watch(f,opts) { // broken
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
              konsole.log(name,"resolved@",time_since);
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
    is: function exists(f) { // broken
      return uR.test.watch(f).then(
        function() { konsole.log("test pass: "+f.name) },
        function() { konsole.log("test fail: "+f.name) }
      )
    },
    watchFor: function watchFor(querySelector) { // broken
      var f = function() { return document.querySelector(querySelector) }
      return function() { return uR.test.watch(f,{name: "watchFor "+querySelector}); }
    },
    click: function click(element) {
      return function(resolve,reject) {
        element = (element instanceof HTMLElement)?element:document.querySelector(element);
        try {
          element.click();
        } catch(e) {
          return reject(e);
        }
        konsole.log("clicked "+element);
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
      when(f) {
        this.promise = this.promise.then(uR.test.when(f));
        return this;
      }
      waitFor() {
        this.promise = this.promise.then(uR.test.waitFor.apply(this,[].slice.apply(arguments)));
        return this
      }
    }
  }
})();
