function testCalendar() {
  this.do("testing calendar")
    .route("#calendar-demo")
    .wait("#content calendar")
    .checkResults()
    .done("calendar has not changed")
}

konsole.addCommands(testCalendar)
