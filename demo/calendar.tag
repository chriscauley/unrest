<calendar>
  <div class="top" if={ current_moment }>
    <a class={ disabled: !allow_prev_month } onclick={ showPrevMonth }>&laquo; { prev_month.format("MMMM") }</a>
    <div class="title">{ current_moment.format("MMMM YYYY") }</div>
    <a class={ disabled: !allow_next_month } onclick={ showNextMonth }>{ next_month.format("MMMM") } &raquo;</a>
  </div>
  <div class="week" each={ week,i in calendar.weeks }>
    <div class="day { current: day.current, desktop: !day.occurrences }" each={ day, i in week.days }>
      <div class="dom">{ day.moment.date() }</div>
      <yield/>
    </div>
  </div>

  <style scoped>
    :scope { display: block; position: relative; }
    :scope a { cursor: pointer; }
    :scope a.disabled { filter: grayscale(1); cursor: default; }
    :scope * { box-sizing: border-box; }
    :scope .week { align-items: stretch; display: flex; min-height: 100px; }
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

  showNextMonth(e) {
    if (!this.allow_next_month) { return; }
    this.setFirstDate(this.current_moment.clone().add(1,"months"));
  }

  showPrevMonth(e) {
    if (!this.allow_prev_month) { return; }
    this.setFirstDate(this.current_moment.clone().add(-1,"months"));
  }

  this.setFirstDate = function(d) {
    this.first_date = d;
    this.current_moment = moment(this.first_date,"YYYY-MM-DD").startOf("month");
    this.update();
    this.prev_month = this.current_moment.clone().add(-1,"months");
    this.next_month = this.current_moment.clone().add(1,"months");
    this.allow_prev_month = (this.min_month < this.current_moment);
    this.allow_next_month = (this.max_month > this.current_moment);
  }

  this.on("before-mount",function() {
    this.calendar = {};
    this.max_month = moment(this.opts.max_month || "4000-01-01","YYYY-MM-DD");
    this.min_month = moment(this.opts.min_month || "1900-01-01","YYYY-MM-DD");
    this.occurrences = this.opts.occurrences || [];
    if (this.opts.date) { this.setFirstDate(this.opts.date); }
    else if (this.occurrences.length) { this.setFirstDate(this.occurrences[0].start) }
    else { this.setFirstDate(moment().format("YYYY-M-D")) }
  })
  this.on("mount",function() {
    this.update();
  });
  this.on("update", function() {
    if (!this.first_date) { return; }
    this.day_occurrences = {};
    for (var i=0;i<this.occurrences.length;i++) {
      var o = this.occurrences[i];
      o.moment = moment(o.start,'YYYY-MM-DD');
      if (o.end) { o.end_moment = moment(o.end,'YYYY-MM-DD'); }
      var d = o.moment.format("YYYY-MM-DD");
      this.day_occurrences[d] = this.day_occurrences[d] || [];
      this.day_occurrences[d].push(o);
    }
    var current_moment = this.current_moment.clone().date(1).day(0);
    var last_moment = this.current_moment.clone().endOf('month').day(6);
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
        current: current_moment.month() == this.current_moment.month(),
        occurrences: this.day_occurrences[current_moment.format("YYYY-MM-DD")],
      }
      week.days.push(day);
      current_moment.add(1,'day')
    }
  });
</calendar>
