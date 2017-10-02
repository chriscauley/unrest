uR.ready(function() {
  uR.config.MODAL_PREFIX = "#!"; // this app uses has routing
  uR.config.STATIC_URL = "/demo/";
  uR.config.default_tabs = true;
  uR.startRouter();
  uR.addRoutes({
    "#tabs-demo": function() { uR.loadTemplate("tabs-demo") },
    "#markdown-demo": function() { uR.loadTemplate("markdown-demo") },
    "#calendar-demo": function() { uR.loadTemplate("calendar-demo") },
    "#ur-form-demo": function() { uR.loadTemplate("ur-form-demo") }
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

