uR.ready(function() {
  uR.config.STATIC_URL = "/demo/"
  uR.config.default_tabs = true
  uR.router.start()
  const links = [
    "UR Form",
    "Tabs",
    "Markdown",
    "Calendar",
    "Calculator",
    "Under Construction",
  ];
  links.forEach(text => {
    uR.nav.add({
      href: `#${uR.slugify(text)}-demo`,
      text: text,
    })
  });
  uR.router.add({
    "#([^/]+)-demo": function(path,data) {
      const name = data.matches[1]
      uR.loadTemplate(name+"-demo",data)
    },
  });
})

function foo(e) {
  alert("foo "+e);
}

