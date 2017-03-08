describe("DOM Tests", function () {
  uR.forEach(SCHEMA,function(s) { s.required = false; });
  uR.mountElement("ur-form",{
    schema:SCHEMA,
    onload: function() {
      uR.forEach(this.field_list,function(field) {
        uR.test.testNonRequiredElement(field);
      });
    }
  });
});
