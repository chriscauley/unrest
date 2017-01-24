uR.test.links = [ "../node_modules/mocha/mocha.css" ];
uR.test.scripts = [
  "dummy_data.js",
  "../node_modules/mocha/mocha.js",
  "../node_modules/chai/chai.js"
];

uR.test.prep = function() {
  if (!document.getElementById("mocha")) {
    var e = document.createElement("div");
    e.id = "mocha";
    document.body.appendChild(e);
  }
  mocha.ui('bdd');
  mocha.reporter('html');
  window.expect = chai.expect;
};

uR.test.start = function() {
  (window.mochaPhantomJS || mocha).run(uR.setError);
}
