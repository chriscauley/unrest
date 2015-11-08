<calendar>
  <h1>{ moment.format("MMMM YYYY") }</h1>
  <div if={ selected }>selected!!!</div>
  <div class="week" each={ calendar.weeks }>
    <div class="day { current: current, desktop: !occurrences }" each={ days }>
      <div class="dom">{ moment.date() }</div>
      <div each={ occurrences }><yield/></div>
    </div>
  </div>
  <modal if={ active } cancel={ cancel } class="absolute">
    <h2>{ parent.opts.name }</h2>
    { parent.active.moment.format("dddd MMMM Do, YYYY") }
    <br />
    { parent.active.moment.format("h:mm a") } - { window.moment(parent.active.end).format("h:mm a"); }
  </modal>

  <style scoped>
    :scope { display: block; position: relative; }
    * { box-sizing: border-box; }
    .week { align-items: stretch; display: flex; height: 100px; }
    .day { flex: 0 1 auto; border: 1px solid black; opacity: 0.5; padding: 5px; width: 14.285714285%; }
    .day.current { opacity: 1; }
    .dom { font-weight: bold; text-align: right; }
    .desktop { display: block; }
    .mobile { display: none; }
    .occurrence:before { content: attr(data-prefix); }
    @media (max-width: 480px) {
      .day { width: 100%; padding-bottom: 20px; }
      .week { height: auto; display: block; }
      .desktop { display: none; }
      .mobile { display: block; }
      .dom { text-align: center; }
    }
    @media (max-width: 768px) {
      .occurrence:before { content: ""; }
    }
  </style>

  var that = this;
  select(e) {
    this.active = e.item;
    this.update();
  }

  cancel(e) {
    this.active = null;
    this.update();
  }

  this.on("update", function() {
    var first_date;
    this.opts.occurrences = this.opts.occurrences || [];
    if (this.opts.date) { first_date = this.opts.date; }
    else if (this.opts.occurrences && this.opts.occurrences.length) {
      first_date = this.opts.occurrences[0].start;
    }
    this.moment = moment(first_date);
    this.day_occurrences = {};
    for (var i=0;i<this.opts.occurrences.length;i++) {
      var o = this.opts.occurrences[i];
      o.moment = moment(o.start);
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
