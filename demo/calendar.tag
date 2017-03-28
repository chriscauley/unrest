<calendar>
  <div class="top">
    <a if={ prev_month } onclick={ showPrevMonth }>&laquo; { prev_month.format("MMMM") }</a>
    <div class="title">{ moment.format("MMMM YYYY") }</div>
    <a if={ next_month } onclick={ showNextMonth }>{ next_month.format("MMMM") } &raquo;</a>
  </div>
  <div class="week" each={ calendar.weeks }>
    <div class="day { current: current, desktop: !occurrences }" each={ days }>
      <div class="dom">{ moment.date() }</div>
      <yield/>
    </div>
  </div>

  <style scoped>
    :scope { display: block; position: relative; }
    :scope a { cursor: pointer; }
    :scope * { box-sizing: border-box; }
    :scope .week { align-items: stretch; display: flex; height: 100px; }
    :scope .day { flex: 0 1 auto; border: 1px solid black; opacity: 0.5; padding: 5px; width: 14.285714285%; }
    :scope .day.current { opacity: 1; }
    :scope .dom { font-weight: bold; text-align: right; }
    :scope .desktop { display: block; }
    :scope .mobile { display: none; }
    :scope .occurrence:before { content: attr(data-prefix); }
    @media (max-width: 480px) {
      :scope .day { width: 100%; padding-bottom: 20px; }
      :scope .week { height: auto; display: block; }
      :scope .desktop { display: none; }
      :scope .mobile { display: block; }
      :scope .dom { text-align: center; }
    }
    :scope .title { font-size: 2em; font-weight: 0.2em; }
    :scope .top { align-items: center; display: flex; justify-content: space-between; }
    @media (max-width: 768px) {
      :scope .occurrence:before { content: ""; }
    }
  </style>

  var that = this;
  select(e) {
    e.item.active = true;
    this.active_item = e.item;
    this.update();
  }

  cancel(e) {
    this.active_item.active = false;
    this.active_item = null;
    this.update();
  }

  this.setFirstDate = function(d) {
    this.first_date = d;
    this.moment = moment(new Date(this.first_date));
    this.update();
    this.prev_month = this.opts.prev_month && this.moment.clone().add(-1,"months");
    this.next_month = this.opts.next_month && this.moment.clone().add(1,"months");
  }

  this.on("mount",function() {
    this.occurrences = this.opts.occurrences || [];
    if (this.opts.date) { this.setFirstDate(this.opts.date); }
    else if (this.occurrences.length) { this.setFirstDate(this.occurrences[0].start) }
    else { this.setFirstDate(moment().format("YYYY-M-D")) }
  });

  this.on("update", function() {
    if (!this.first_date) { return; }
    this.day_occurrences = {};
    for (var i=0;i<this.occurrences.length;i++) {
      var o = this.occurrences[i];
      o.moment = moment(new Date(o.start));
      if (o.end) { o.end_moment = moment(new Date(o.end)); }
      var d = o.moment.dayOfYear();
      this.day_occurrences[d] = this.day_occurrences[d] || [];
      this.day_occurrences[d].push(o);
    }
    var current_moment = this.moment.clone().date(1).day(0).startOf('day');
    var last_moment = this.moment.clone().endOf('month').day(6).startOf('day');
    var c = 0;
    var week = {days: []};
    this.calendar = {weeks: []};
    while (true) {
      c++;
      if (c > 100) { console.log('fail'); break }
      if (week.days.length >= 7) {
        this.calendar.weeks.push(week);
        week = {days: []};
        if (current_moment.isAfter(last_moment)) { break }
      }
      var day = {
        moment: current_moment.clone(),
        current: current_moment.month() == this.moment.month(),
        occurrences: this.day_occurrences[current_moment.dayOfYear()],
      }
      week.days.push(day);
      current_moment.add(1,'day')
    }
  });
  foo(e) {
    console.log(e)
  }
</calendar>
