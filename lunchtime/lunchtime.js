(function() {
  String.lunch = {
    moment_cache: {},
    s2_cache: {},

    date: "YYYYMMDD",
    time: "Hmm",
    datetime: "",

    at: " at ",
    hdate: "MMM Do, YYYY",
    hdate_no_year: "MMM Do",
    htime_hour: "h? A",
    htime_minute: ":mm",
    _seconds_math: {
      second: 1,
      minute: 60,
      hour: 60*60,
      day: 24*60*60,
      week: 7*24*60*60,
      no_second: 5*60, // don't show seconds if more than 5 minutes
      no_minute: 2*60*60, // don't show minutes if more than 2 hours
      no_hour: 2*24*60*60, // don't show hours if more than 2 days
      list: ['week','day','hour','minute','second'],
    },
    clear: function() {
      delete String.lunch.moment_cache;
      delete String.lunch.s2_cache;
      String.lunch.moment_cache = {};
      String.lunch.s2_cache = {}
    },
    ms2hdelta: function(ms) {
      var abs = Math.abs(ms)/1000; // absolute number of seconds
      if (abs < 1) { return "0s"; }
      var _sm = Sl._seconds_math; // going to be typing this a lot
      var unit_big,unit_small,value = abs;
      var s=(ms<0)?"-":"+"; // sign of timedelta
      var v="",V; // value big and small, (eg [3,2] for "3 days and 2 hours", would return "3d2h")
      var u="",U; // unit abbreviation big and small, (eg ["d","h"] for above example)
      for (var i=0;i<_sm.list.length;i++) {
        unit_big = _sm.list[i];
        if (abs >= _sm[unit_big]) { // eg. absolute value of ms is more than 1 month|week|day... worth of ms
          V = Math.floor(abs/_sm[unit_big]); // value/big_conversion_factor
          U = unit_big[0];
          unit_small = _sm.list[i+1];
          if (unit_small && abs < _sm["no_"+unit_small]) {
            v = Math.floor((abs%_sm[unit_big])/_sm[unit_small]) || ""; // remainder/small_conversion_factor
            u = v && unit_small[0];
          }
          break;
        }
      }
      return `${s}${V}${U}${v}${u}`; // sVUvu or "+3d2h" or "sign big_value big_unit small_value small_unit", ya dig?
    }
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
  String.prototype.timedelta = function() {
    if (this.indexOf("||") == -1) { return (moment().format()+"||"+this).timedelta() }
    var [s1,s2] = this.split("||");
    return new Date(s1) - new Date(s2);
  }
  String.prototype.htimedelta = function() {
    if (this.indexOf("||") == -1) { return (moment().format()+"||"+this).htimedelta() }
    var m = this.moment();
    return Sl.ms2hdelta((this.moment()-Sl.s2_cache[this].moment()))
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
    return m.format(Sl.htime_hour).replace("?",m.minutes()?m.format(":mm"):"")
  }
  String.prototype.hdatetime = function() {
    return this.hdate() + Sl.at + this.htime();
  }
  String.prototype.itime = function() {
    return parseInt(this.time());
  }
  String.prototype.unixtime = function() { return this.moment()+0 }

  var tt_cache = {};
  var target_time_interval;
  function _watch() {
    var elements = document.querySelectorAll("[data-target_time]");
    var now = new Date().valueOf();
    // var count = 0 // #! TODO Revisit how frequently this is called... could become a performance issue
    for (var e of elements) {
      var target = e.dataset.target_time;
      if (e.textContent && tt_cache[target] && tt_cache[target] > now) { return }
      //count ++; // #! ibid
      delta_ms = now-target;
      e.textContent = String.lunch.ms2hdelta(delta_ms);
      tt_cache[target] = now;
      if (delta_ms < 3600000) { return } // less than an hour needs immediate update
      tt_cache[target] += 60000; // update in a minute
    };
    //console.log(count) #! ibid
  }
  Sl.watchTimers = function() {
    clearInterval(target_time_interval);
    _watch()
    target_time_interval = setInterval(_watch,1000);
  }
  Sl.stopTimers = function() { clearInterval(target_time_interval); }
})();
