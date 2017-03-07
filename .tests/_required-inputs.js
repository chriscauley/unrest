describe("DOM Tests", function () {
  uR.mountElement("ur-form",{
    schema:SCHEMA,
    initial: INITIAL,
  });
  for (var name in INITIAL) {
    testRequiredElement(name,INITIAL[name]);
  }
});
