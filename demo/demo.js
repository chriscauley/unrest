uR.ready(function() {
  uR.config.STATIC_URL = "/demo/";
  uR.config.default_tabs = true;
  uR.router.start();
  uR.admin.start();
  uR.router.add({
    "#([^/]+)-demo": function(path,data) {
      uR.loadTemplate(data.matches[1]+"-demo");
      uR.newElement("script",{
        src: "tests/"+data.matches[1]+".js",
        parent: document.body,
      });
    },
  });
  uR.ajax({
    url:"holidays.json",
    success: function(data) {
      var dates = []
      for (var date in data) { dates.push(date) }
      occurrences = [
        { 'start': '2015-6-20 7:00 pm', 'name': 'My birthday party', 'end': '2015-6-20 9:00 pm' }
      ];
      for (var i=0;i<dates.length;i++) {
        var d = dates[i];
        for (var i2=0;i2<data[d].length;i2++) {
          var o = data[d][i2];
          o.start = o.date;
          occurrences.push(o);
        }
      }
      riot.mount("calendar",{occurrences: occurrences});
    }
  });
})

function foo(e) {
  alert("foo "+e);
}

