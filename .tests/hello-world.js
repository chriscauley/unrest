var page = require('webpage').create();
page.open('.tests/index.html', function(status) {
  function log(v){ console.log(v)}
  var h1 = page.evaluate(function() {
    return document.querySelector("h1");
  })
  phantom.exit();
});
