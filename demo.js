var request = new Http.Get("http://holidayapi.com/v1/holidays?country=US&year=2015",true);
request.start().then( function(response) {
  var holidays = JSON.parse(response).holidays;
  var dates = []
  for (var date in holidays) {
    dates.push(date)
  }
  occurrences = []
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
