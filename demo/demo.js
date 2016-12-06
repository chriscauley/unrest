var request = new Http.Get("http://holidayapi.com/v1/holidays?country=US&year=2015&api_key=444aa655-ae73-44b7-9ecf-3e29a37dfbb6",true);
request.start().then( function(response) {
  var holidays = JSON.parse(response).holidays;
  var dates = []
  for (var date in holidays) {
    dates.push(date)
  }
  occurrences = [
    { 'start': '2015-6-20 7:00 pm', 'name': 'My birthday party', 'end': '2015-6-20 9:00 pm' }
  ];
  for (var i=0;i<dates.length;i++) {
    var d = dates[i];
    for (var i2=0;i2<holidays[d].length;i2++) {
      var o = holidays[d][i2];
      o.start = o.date;
      occurrences.push(o);
    }
  }
  riot.mount("calendar",{occurrences: occurrences});
});

function foo(e) {
  alert("foo "+e);
}

riot.mount("markdown,ur-tabs");
