describe("DOM Tests", function () {
  uR.mountElement("ur-form",{schema:SCHEMA,initial:INITIAL});
  uR.ajax = function(options) {
    window.DATA = options.data;
  }
  document.querySelector("#submit_button").dispatchEvent(new Event("click"));
  for (key in INITIAL) {
    it(key+" has the correct value", function() {
      expect(window.DATA[key]).to.equal(INITIAL[key]);
    });
  }
});
