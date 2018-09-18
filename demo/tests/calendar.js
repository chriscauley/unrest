function testCalendar() {
  this.do("testing calendar")
    .route("#calendar-demo")
    .wait("#content calendar")
    .checkResults()
}

konsole.addCommands(testCalendar)
