function testMarkdown() {
  this.do("testing markdown")
    .route("#markdown-demo")
    .wait("#content markdown")
    .checkResults()
    .wait("ur-tab[title=Code]")
    .checkResults()
    .wait("ur-tab[title=Result]")
    .checkResults()
    .done("markdown has not changed")
}

konsole.addCommands(testMarkdown);
