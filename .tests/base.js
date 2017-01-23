(function() {
  uR.auth.reset = function() {};
  uR.test = function(path) {
    if (!uR.test.loaded) {
      uR.forEach(uR.test.scripts,function(s) {
        var script = document.createElement("script");
        script.src = s;
        document.body.appendChild(script);
      });
      uR.forEach(uR.test.links,function(s) {
        var link = document.createElement("link");
        link.href = s;
        link.rel = "stylesheet";
        document.body.appendChild(link);
      });
      uR.test.loaded = true;
      return setTimeout(function() {uR.test(path)},1000);
    }
    uR.test.prep();
    var script = document.createElement("script");
    script.src = path;
    script.onload = uR.test.start;
    document.body.appendChild(script);
  }
  uR.test.scripts = [];
  uR.test.links = [];
  uR.test.prep = function() {};
  uR.test.start = function() {};
  if (uR.getQueryParameter("ur-test")) {
    uR.ready(function() { uR.test(uR.getQueryParameter("ur-test")); });
  }
})();
