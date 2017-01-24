describe("DOM Tests", function () {
  uR.forEach(SCHEMA,function(s) { s.required = false; });
  uR.mountElement("ur-form",{schema:SCHEMA});
  for (var name in INITIAL) {
    testNonRequiredElement(name,INITIAL[name]);
  }
});
