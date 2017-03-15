describe("DOM Tests", function () {
  uR.mountElement("ur-form",{
    schema:SCHEMA,
    initial: INITIAL,
    onload: function() {
      var select_element = document.querySelector("[name=select_color]");
      var select_field = this.fields.select_color;
      var submit_button = document.getElementById("submit_button");
      it("Select has initial value: "+INITIAL.select_color,function(){
        expect(this.form_tag.getData().select_color).to.equal(INITIAL.select_color);
        expect(select_element.value).to.equal(INITIAL.select_color);
        expect(select_field.valid).to.be.true;
      }.bind(this));
      it("Select raises an error when set to no value",function() {
        select_element.value = "";
        select_element.dispatchEvent(new Event("blur"));
        expect(select_field.valid).to.be.false;
        expect(submit_button.classList.contains("disabled")).to.be.true;
      });
      it("Select loses error when set to value",function() {
        select_element.value = "red";
        select_element.dispatchEvent(new Event("blur"));
        expect(select_field.valid).to.be.true;
        expect(submit_button.classList.contains("disabled")).to.be.false;
      })
    }
  });
});
