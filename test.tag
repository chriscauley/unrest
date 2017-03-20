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
  <h4>Tests</h4>
  <ul>
    <li each={ links }>
      <span class={ s_class }>{ status }</span> <a href="?ur-test={ url }">{ url }</a>
    </li>
  </ul>
  <!--
  <h4>Events</h4>
  <table>
    <tr>
      <th>Tag name</th>
      <th>Updates</th>
      <th>Mounts</th>
    </tr>
    <tr each={ stt in sorted_tag_types }>
      <td each={ v in stt }>{ v }</td>
    </tr>
  </table>
  -->

var self = this;
this.on("mount",function() {
  /*
  self.tag_types = {};
  this.links = [];
  update_proxy = uR.dedribble(this.update.bind(this),2000);
  riot.mixin({
    init: function() {
      this.on("*",function(s) {
        var tag_name = this.root.tagName;
        self.tag_types[tag_name] = self.tag_types[tag_name] || {};
        self.tag_types[tag_name][s] = (self.tag_types[tag_name][s] || 0)+1;
        if (tag_name != "LINK-LIST") { update_proxy(); }
      });
    }
  });
  uR.forEach(uR.TESTING,function(l) {
    var link = { url: l, status: "untested" };
    var errors = uR.storage.get(l);
    if (errors == 0) { link.status = "pass"; link.s_class = "green"; }
    if (errors) { link.status = errors; link.s_class = "red"; }
    self.links.push(link);
  });*/
  this.update();
});
/*
this.on("update",function() {
  self.sorted_tag_types = [];
  for (k in self.tag_types) {
    var tt = [k,self.tag_types[k].updated,self.tag_types[k].mount];
    self.sorted_tag_types.push(tt);
    console.log(tt);
  }
});
*/
</link-list>
