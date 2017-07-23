(function() {
  String.lunch = {
    cache1: {},
    cache2: {},

    date: "YYYY-MM-DD",
    time: "HH:mm",
    datetime: "",

    hdate: "MMM Do, YYYY",
    hdate_no_year: "MMM Do",
    htime_hour: "H? A",
    htime_minute: ":mm",
  };

  var Sl = String.lunch;
  String.prototype.moment = function moment() {
    if (String.lunch.cache1[this]) { return String.lunch.cache1[this] }
    var s1 = this,s2,m1,m2;
    if (s1.indexOf("||") != -1) {
      [s1,s2] = s1.split("||");
    }
    if (this.match(/^\d\d?:\d\d/)) { // passing in time with no date, set date to today
      m1 = window.moment(window.moment().format("YYYY-MM-DD ") + s1);
    } else {
      m1 = window.moment(s1);
    }
    if (s2 && s2.match(/^\d\d?:\d\d/)) {
      s2 = m1.format(Sl.date)+" "+s2;
      m2 = window.moment(s2);
      if (m2 < m1) {
        m2 = m2.add(1,'days')
      }
    }
    String.lunch.cache1[this] = m1;
    String.lunch.cache2[this] = m2;
    return m1;
  }
  String.prototype.format = function(s) { return this.moment().format(s); }
  String.prototype.calendar = function calendar(s) {
    return this.moment().calendar(s);
  }
  String.prototype.range = function(format) {
    this.moment();
    return this.hdate()+ " - "+Sl.cache2[this].hdate();
  }

  String.prototype.date = function date() { return this.moment().format(Sl.date); }
  String.prototype.time = function time() { return this.moment().format(Sl.time); }
  String.prototype.datetime = function datetime() { return this.moment().format(Sl.datetime); }

  String.prototype.hdate = function() {
    var now = window.moment();
    var m = this.moment();
    var diff = m-now;
    if (Math.abs(diff) < 1000 * 3600 * 24 *60) { // less than two months away from now
      if (now.month() == m.month() && now.date() == m.date()) {
        return "Today";
      }
      if (diff > 0) {
        if (diff < 1000*3600*24) { return "Tomorrow" }
      }
      return m.format(String.lunch.hdate_no_year)
    }
    return m.format(String.lunch.hdate)
  }
  String.prototype.htime = function htime() {
    var m  = this.moment();
    return m.format('h? A').replace("?",m.minutes()?m.format(":mm"):"")
  }
  String.prototype.hdatetime = function() {
    return this.hdate() + " at " + this.htime();
  }
})();
