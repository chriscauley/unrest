function testNewYears() {
  return this.do("test january first")
    .wait("lunch-table input")
    .changeValue("lunch-table input","2017-01-01 12:00")
    .checkResults("lunch-table table")
    .wait(4000)
}

konsole.addCommands(testNewYears);