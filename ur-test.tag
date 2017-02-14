function changeElement(element,value) {
  element.value = value;
  element.dispatchEvent(new Event("change"));
  element.dispatchEvent(new Event("keyup"));
  element.dispatchEvent(new Event("blur"));
}
function testRequiredElement(name,initial) {
  var element = document.querySelector("[name="+name+"]");
  var root = document.querySelector("ur-input."+name);
  it(element.name+" has correct initial value", function() {
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

function testNonRequiredElement(name,initial) {
  var element = document.querySelector("[name="+name+"]");
  var root = document.querySelector("ur-input."+name);
  it(element.name+" has no initial value", function() {
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
(function() {
  // uR.auth.reset = function() {};
  // this causes all sorts of problems :(
  uR.test = function(path) {
    if (uR.test.loading) { return }
    if (!uR.test.loaded) {
      uR.forEach(uR.test.scripts,function(s) {
        var script = document.createElement("script");
        script.src = uR.static(s);
        document.body.appendChild(script);
      });
      uR.forEach(uR.test.links,function(s) {
        var link = document.createElement("link");
        link.href = uR.static(s);
        link.rel = "stylesheet";
        document.body.appendChild(link);
      });
      uR.test.loaded = true;
      return setTimeout(function() {uR.test(path)},1000);
    }
    uR.test.prep();
    var script = document.createElement("script");
    script.onload = uR.test.start;
    script.src = path;
    document.body.appendChild(script);
  }
  uR.test.scripts = [];
  uR.test.links = [];
  uR.test.loading = 0;
  uR.test.prep = function() {};
  uR.test.start = function() {};
  if (uR.getQueryParameter("ur-test")) {
    var t = uR.getQueryParameter("ur-test");
    var t_path = t.match(/.*\//);
    if (t_path) { t_path = t_path[0]; }
    else {
      var script_tags = document.getElementsByTagName('script');
      t_path = script_tags[script_tags.length-1].src.match(/.*\//)[0]+"../.tests/";
    }
    uR.pready("unrest/.tests/mocha-chai.js");
    uR.pready(t_path+"dummy_data.js");
    uR.ready(function() { uR.test(t); });
  }

  uR.setError = function(count) {
    uR.storage.set(uR.getQueryParameter("ur-test"),count || 0)
  }
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
    uR.forEach(this.opts.links,function(l) {
      var link = { url: l, status: "untested" };
      var errors = uR.storage.get(l);
      if (errors == 0) { link.status = "pass"; link.s_class = "green"; }
      if (errors) { link.status = errors; link.s_class = "red"; }
      self.links.push(link);
    });
    this.update();
  });
</link-list>
