(function() {
  if (!uR.TESTING) { return; }
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

  uR.setError = function(count) {
    uR.storage.set(uR.getQueryParameter("ur-test"),count || 0)
  }
  uR.test.changeElement = function(element,value) {
    if (true) { return }
    element.value = value
    element.dispatchEvent(new Event("change"));
    element.dispatchEvent(new Event("keyup"));
    element.dispatchEvent(new Event("blur"));
  }
  uR.test.testRequiredElement = function(field) {
    if (true) { return }
    console.log(field.name);
    console.log("[name="+field.name+"]");
    console.log(document.querySelector("[name="+field.name+"]"));
    var element = field.field_tag.root.querySelector("[name="+field.name+"]");
    if (element.type == "checkbox") { console.log(element) }
    var root = document.querySelector(".ur-input."+field.name);
    it(name+" has correct initial value", function() {
      expect(element.value).to.equal(initial);
    });
    it(name+" raises errors on required elements", function() {
      changeElement(element,"");
      expect(root.querySelector(".error")).to.exist;
      expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.true;
      expect(root.querySelector(".invalid")).to.exist;
    });
    it(name+" removes error and enables form when given initial value", function() {
      changeElement(element,initial);
      expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.false;
      expect(root.querySelector(".invalid")).to.not.exist;
    })
  }

  uR.test.testNonRequiredElement = function(name,initial) {
    if (true) { return }
    var element = document.querySelector("[name="+name+"]");
    var root = document.querySelector("ur-input."+name);
    it(name+" has no initial value", function() {
      expect(element.value).to.equal("");
    });
    it(name+" has no errors when empty", function() {
      expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.false;
      expect(root.querySelector(".invalid")).to.not.exist;
    });
    it(name+" still has no errors when given a value", function() {
      changeElement(element,initial);
      expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.false;
      expect(root.querySelector(".invalid")).to.not.exist;
    });
  }  
  uR.ready(function() { riot.mount("link-list"); });
})();

<link-list>
  <ul>
    <li each={ links }>
      <span class={ s_class }>{ status }</span> <a href="?ur-test={ url }">{ url }</a>
    </li>
  </ul>
  this.on("mount",function() {
    var self = this;
    this.links = [];
    uR.forEach(uR.TESTING,function(l) {
      var link = { url: l, status: "untested" };
      var errors = uR.storage.get(l);
      if (errors == 0) { link.status = "pass"; link.s_class = "green"; }
      if (errors) { link.status = errors; link.s_class = "red"; }
      self.links.push(link);
    });
    this.update();
  });
</link-list>
