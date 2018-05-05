(function() {
  String.lunch = {
    moment_cache: {},
    s2_cache: {},

    date: "YYYYMMDD",
    time: "Hmm",
    datetime: "",

    hdate: "MMM Do, YYYY",
    hdate_no_year: "MMM Do",
    htime_hour: "H? A",
    htime_minute: ":mm",
    _seconds_math: {
      second: 1,
      seconds: 2,
      minute: 60,
      minutes: 2*60,
      hour: 60*60,
      hours: 2*60*60,
      day: 24*60*60,
      days: 2*24*60*60,
      week: 7*24*60*60,
      weeks: 2*7*24*60*60,
      list: ['week','day','hour','minute','second'],
    },
  };

  var Sl = String.lunch;
  String.prototype.moment = function moment() {
    if (String.lunch.moment_cache[this]) { return String.lunch.moment_cache[this] }
    var s1 = this,m1,s2,m2;
    if (s1.indexOf("||") != -1) {
      [s1,s2] = s1.split("||");
    }
    if (this.match(/^\d\d?:\d\d/)) { // passing in time with no date, set date to today
      m1 = window.moment(window.moment().format("YYYY-MM-DD ") + s1);
    } else {
      var m1 = window.moment(s1.toString());
    }
    if (s2 && s2.match(/^\d\d?:\d\d/)) {
      s2 = m1.format(Strin.lunch.date)+" "+s2;
      m2 = window.moment(s2);
      if (m2 < m1) {
        m2 = m2.add(1,'days')
      }
    }
    String.lunch.moment_cache[this] = m1;
    String.lunch.s2_cache[this] = s2;
    return m1;
  }
  String.prototype.format = function(s) { return this.moment().format(s); }
  String.prototype.calendar = function calendar(s) {
    return this.moment().calendar(s);
  }
  String.prototype.range = function(format) {
    this.moment();
    return this.hdate()+ " - "+Sl.s2_cache[this].hdate();
  }
  String.prototype.htimedelta = function(format) {
    if (this.indexOf("||") == -1) { return (this+"||"+moment().format()).htimedelta() }
    var m = this.moment();
    var seconds = (this.moment()-Sl.s2_cache[this].moment())/1000;
    var abs = Math.abs(seconds);
    var _sm = Sl._seconds_math; // going to be typing this a lot
    var unit,value = abs;
    for (var i=0;i<_sm.list.length;i++) {
      unit = _sm.list[i];
      if (abs > _sm[unit+'s']) { // eg. absolute value of seconds is more than 2 weeks worth of seconds
        value = Math.floor(abs/_sm[unit]);
        if (value>1) { unit += "s" }
        break;
      }
    }
    return (Math.sign(seconds)*value) + " " + unit;
  }
  String.prototype.htimerange = function(format) {
    this.moment();
    var m1 = this.moment();
    var m2 = Sl.s2_cache[this].moment();
    var time1 = m1.format(m1.minute()?"h:mm":"h"); // 12 or 12:45
    if (m1.hour()>=12 != m2.hour()>=12) { time1 += m1.format(" A") } // add am/pm if am/pm changes from time1 to time2
    return time1 + " - " + Sl.s2_cache[this].htime() // h(:mm)? (am|pm)? - h(:mm)? am|pm
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
  String.prototype.itime = function() {
    return parseInt(this.time());
  }
  String.prototype.unixtime = function() { return this.moment()+0 }
})();
