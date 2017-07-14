uR.ready(function() {
  String.prototype.moment = function moment() {
    var m = window.moment(new Date(this));
    return m
  }
  String.prototype.date = function() { return  this.moment().format("YYYY-MM-DD"); }
  String.prototype.hdate = function (){
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
      return m.format("MMMM Do");
    }
    return m.format("MMMM Do, YYYY")
  }
  String.prototype.htime= function() {
    var m  = this.moment();
    return m.format('h? A').replace("?",m.minutes()?m.format(":mm"):"")
  }
})
