function testMarkdown() {
  this.do("testing markdown")
    .route("#markdown-demo")
    .wait("#content markdown")
    .checkResults()
    .click(".tab-anchors [title=Code]")
    .wait("ur-tab[title=Code]")
    .checkResults()
    .click(".tab-anchors [title=Result]")
    .wait("ur-tab[title=Result]")
    .checkResults()
    .done("markdown has not changed")
}

konsole.addCommands(testMarkdown);
