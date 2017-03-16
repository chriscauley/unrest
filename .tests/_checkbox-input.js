/* #! TODO:
* Test it without initial
* Test not required
* Test radio (basically a whole suite for that).
* Test with no choices (hide <label> and have one choice: ["true",field.label])
*/

describe("DOM Tests", function () {
  uR.mountElement("ur-form",{
    schema:SCHEMA,
    initial: INITIAL,
    onload: function() {
      var element_map = {};
      var ur_field = this.fields.checkboxes;
      var initial = ur_field.initial;
      it("Checkbox has correct initial value",function() {
        expect(initial.length).to.equal(1);
        expect(initial[0]).to.equal(INITIAL[ur_field.name]);
      });
      var submit_button = this.form_tag.submit_button;
      uR.forEach(ur_field.field_tag.root.querySelectorAll("[name="+ur_field.name+"]"),function(f) {
        element_map[f.value] = f;
      });
      it("Correct checkbox initially checked: "+initial,function(){
        expect(this.form_tag.getData()[ur_field.name][0]).to.equal(initial[0]);
        expect(this.form_tag.getData()[ur_field.name].length).to.equal(1);
        for (var value in element_map) {
          expect(element_map[value].checked == (initial[0] == value)).to.be.true;
        }
        expect(!!ur_field.valid).to.be.true;
      }.bind(this));
      it("No checked checkboxes raises an error",function() {
        for (value in element_map) {
          element_map[value].checked = false;
          element_map[value].dispatchEvent(new Event("blur"));
        }
        expect(!!ur_field.valid).to.be.false;
        expect(submit_button.classList.contains("disabled")).to.be.true;
      });
      it("Check one and the error goes away",function() {
        element_map.blue.checked = true;
        element_map.blue.dispatchEvent(new Event("blur"));
        expect(!!ur_field.valid).to.be.true;
        expect(submit_button.classList.contains("disabled")).to.be.false;
      });
    }
  });
});
