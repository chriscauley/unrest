uR.ready(function() {
  uR.config.STATIC_URL = "/demo/";
  uR.config.default_tabs = true;
  uR.router.start();
  uR.router.add({
    "#([^/]+)-demo": function(path,data) {
      uR.loadTemplate(data.matches[1]+"-demo");
      uR.newElement("script",{
        src: "tests/"+data.matches[1]+".js",
        parent: document.body,
      });
    },
  });
})

function foo(e) {
  alert("foo "+e);
}

