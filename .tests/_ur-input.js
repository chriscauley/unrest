describe("DOM Tests", function () {
  var _help_text = "help text for ";
  uR.forEach(SCHEMA,function(f) { f.help_text = _help_text + f.name });
  uR.mountElement("ur-form",{
    schema:SCHEMA,
    initial: INITIAL,
    onload: function() {
      uR.forEach(this.field_list,function(field,i) {
        if (uR.form.fields[field.tagname] != uR.form.URInput) { return; }
        var element = field.field_tag.root.querySelector('input');
        var opts = SCHEMA[i];
        it(field.name+" has all the right starting classes",function() {
          var selector = `.${ field.name }.${ field.type }.input-field.ur-input`;
          var input_selector = selector + ` ${ field.input_tagname }`;
          expect(document.querySelectorAll(selector).length).to.equal(1);
          expect(document.querySelectorAll(input_selector).length).to.equal(1);
        });
        var _ht = _help_text + field.name;
        it(`${ field.name } has help_text "${ _ht }"`,function() {
          var selector = `.${ field.name }.${ field.type }.input-field.ur-input .help_text`;
          expect(document.querySelectorAll(selector).length).to.equal(1);
          expect(document.querySelector(selector).innerText).to.equal(_ht);
        });
        it(`${ field.name } has initial value "${ INITIAL[field.name] }"`,function() {
          expect(field.value).to.equal(INITIAL[field.name]);
          expect(field.field_tag.root.querySelector(field.input_tagname).value).to.equal(INITIAL[field.name]);
        });
      });
    },
  });
});
