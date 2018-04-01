function testForm() {
  this.do("ur-form tests")
    .setHash("#ur-form-demo")
    .wait("#id_first_name")
    .checkResults("ur-form-demo ur-form")
    .changeValue("#id_first_name","Testy")
    .changeValue("#id_last_name","Larou")
    .changeValue("#id_email","testy@example.com")
    .checkResults("ur-form-demo ur-form")
    .done("ur-form is great!")
}

konsole.addCommands(testForm)
