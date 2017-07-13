uR.ready(function() {
  function _t(func) {
    return function() {
      return func(window.moment(new Date(this)));
    }
  }
  String.prototype.date = _t(
    function date(moment) { return moment.format("YYYY-MM-DD") }
  )
  String.prototype.verbose_date = _t(function (m){
    var now = moment();
    if (Math.abs(m-now) < 1000 * 3600 * 24 *60) { // less than two months away from now
      if (now.month() == m.month() && now.date() == m.date()) {
        return "Today"
      }
      return m.format("MMMM Do");
    }
    return m.format("MMMM Do, YYYY")
  })
})
