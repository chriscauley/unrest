_.extend(u$,{
  'first_name': '#id_first_name',
})

function testForm() {
  this.do("Capture Empty Form")
    .route("#ur-form-demo")
    .checkResults("ur-form-demo ur-form")

  this.do("Capture filled, valid form")
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

  this.do("Clear form again")
    .changeValue("#id_first_name","")
    .changeValue("#id_last_name","")
    .changeValue("#id_email","")
    .changeValue("#id_phone_number","")
    .click("#id_colors__1")
    .click("#id_colors__2")
    .changeValue("#id_favorite_color","")
    .then(function uncheckColor() {
      var e = document.querySelector("#id_radio_color__0");
      e.checked=false;
      e.dispatchEvent(new Event("change"));
      return true;
    })
    .checkResults("ur-form-demo ur-form")
}

konsole.addCommands(testForm)
