function testCalendar() {
  this.do("testing calendar")
    .wait("[href='#calendar-demo']")
    .click()
    .wait("#content calendar")
    .checkResults()
    .done("calendar has not changed")
}

konsole.addCommands(testCalendar)
