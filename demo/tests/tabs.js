function testTabs() {
  this.do("testing basic tabs functionality")
    .wait("[href='#tabs-demo']")
    .click()
    .wait("#content ur-tabs")
    .checkResults()
    .done("tabs have not changed")
}

konsole.addCommands(testTabs)
