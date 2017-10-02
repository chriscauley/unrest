function testForm() {
  this.do("ur-form tests")
    .setPath("#ur-form-demo")
    .wait("#id_first_name")
    .wait(0) // #! TODO 
    .checkResults("ur-form-demo ur-form")
    .changeValue("#id_first_name","Testy")
    .changeValue("#id_last_name","Larou")
    .changeValue("#id_email","testy@example.com")
    .checkResults("ur-form-demo ur-form")
    .done("ur-form is great!")
}

function testTabs() {
  this.do("testing basic tabs functionality")
    .wait("[href='#tabs-demo']")
    .click()
    .wait("#content ur-tabs")
    .checkResults()
    .done("tabs have not changed")
}

function testMarkdown() {
  this.do("testing markdown")
    .wait("[href='#markdown-demo']")
    .wait(2000)
    .click()
    .wait(2000)
    .wait("#content markdown")
    .wait(2000)
    .checkResults()
    .wait(2000)
    .done("markdown has not changed")
}

function testCalendar() {
  this.do("testing calendar")
    .wait("[href='#calendar-demo']")
    .click()
    .wait("#content calendar")
    .checkResults()
    .done("calendar has not changed")
}

konsole.addCommands(testForm,testTabs,testMarkdown,testCalendar);
