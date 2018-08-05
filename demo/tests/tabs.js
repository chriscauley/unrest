function testTabs() {
  this.do("testing basic tabs functionality")
    .route("#tabs-demo")
    .wait("#content ur-tabs")
    .checkResults()
    .done("tabs have not changed")
}

konsole.addCommands(testTabs)
