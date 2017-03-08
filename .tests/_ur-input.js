describe("DOM Tests", function () {
  var _help_text = "help text for ";
  uR.forEach(SCHEMA,function(f) { f.help_text = _help_text + f.name });
  uR.mountElement("ur-form",{
    schema:SCHEMA,
    initial: INITIAL,
    onload: function() {
      uR.forEach(this.field_list,function(field,i) {
        //console.log(field.tagname,uR.form.fields[field.tagname])
        if (uR.form.fields[field.tagname] != uR.form.URInput) { return; }
        var element = field.field_tag.root.querySelector('input');
        var opts = SCHEMA[i];
        it(field.name+" has all the right starting classes",function() {
          var selector = `.${ field.name }.${ field.type }.input-field.empty.ur-input`;
          var input_selector = selector + ` ${ field.input_tagname }`;
          expect(document.querySelectorAll(selector).length).to.equal(1);
          expect(document.querySelectorAll(input_selector).length).to.equal(1);
        });
        it(field.name+" has help_text",function() {
          var selector = `.${ field.name }.${ field.type }.input-field.empty.ur-input .help_text`;
          expect(document.querySelectorAll(selector).length).to.equal(1);
          expect(document.querySelector(selector).innerText).to.equal(_help_text + field.name);
        });
      });
    },
  });
});
