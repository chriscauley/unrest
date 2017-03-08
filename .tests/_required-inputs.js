describe("DOM Tests", function () {
  uR.mountElement("ur-form",{
    schema:SCHEMA,
    initial: INITIAL,
    onload: function() {
      uR.forEach(this.field_list,function(field) {
        uR.test.testRequiredElement(field);
      });
    },
  });
});
