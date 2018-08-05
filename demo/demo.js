uR.ready(function() {
  uR.config.STATIC_URL = "/demo/"
  uR.config.default_tabs = true
  uR.router.start()
  uR.router.add({
    "#([^/]+)-demo": function(path,data) {
      const name = data.matches[1]
      uR.loadTemplate(name+"-demo",data)
      if (!document.getElementById(name+"__tests")) {
        uR.newElement("script",{
          id: name+"__tests",
          src: "tests/"+name+".js",
          parent: document.body,
        })
      }
    },
  });
})

function foo(e) {
  alert("foo "+e);
}

