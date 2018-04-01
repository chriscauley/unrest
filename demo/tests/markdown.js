function testMarkdown() {
  this.do("testing markdown")
    .wait("#content markdown")
    .checkResults()
    .done("markdown has not changed")
}

konsole.addCommands(testMarkdown);
