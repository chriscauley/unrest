function testForm() {
  this.do("ur-form tests")
    .setHash("#ur-form-demo")
    .wait("#id_first_name")
    .checkResults("ur-form-demo ur-form")
    .changeValue("#id_first_name","Testy")
    .changeValue("#id_last_name","Larou")
    .changeValue("#id_email","testy@example.com")
    .changeValue("#id_phone_number","541-908-0704")
    .click("#id_colors__1")
    .click("#id_colors__2")
    .changeValue("#id_favorite_color","red")
    .click("#id_radio_color__0")
    .checkResults("ur-form-demo ur-form")
    .checkResults(function getData() { return uR.form.current.getData() })
    .changeValue("#id_first_name","")
    .changeValue("#id_last_name","")
    .changeValue("#id_email","")
    .changeValue("#id_phone_number","")
    .click("#id_colors__1")
    .click("#id_colors__2")
    .changeValue("#id_favorite_color","")
    .then(function() {
      var e = document.querySelector("#id_radio_color__0");
      e.checked=false;
      e.dispatchEvent(new Event("change"));
      return true;
    })
    .checkResults("ur-form-demo ur-form")
    .done("ur-form is great!")
}

konsole.addCommands(testForm)
