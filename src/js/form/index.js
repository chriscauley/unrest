(function() {
  uR.form = {
    prepField(field) {
      if (typeof field == "string") { field = { name: field }; }
      return uR.clone(field);
    },
  };
  uR.ready(function() {
    if (uR.config.form_prefix != undefined) {
      var _routes = {};
      _routes[uR.config.form_prefix + "/([\\w\\.]+[\\w]+)/(\\d+)?/?$"] = function(path,data) {
        var url = "/api/schema/"+data.matches[1]+"/";
        if (data.matches[2]) { url += data.matches[2]+"/"; }
        data.schema = url+(location.search||"?ur_page=0");
        data.method = "POST"; // #! TODO this should be an option tied to python schema
        uR.mountElement("ur-form",data);
      };
      uR.router.add(_routes);
    }
  });
  uR.__START = new Date().valueOf();
  uR._t = function(s) { console.log(new Date().valueOf()-uR.__START,s); };
  uR.form.parseChoices = function(choices) {
    // #! TODO This should eventually accomodate groupings as well like:
    // choices = [["group_name",[choice1,choice2,choice3]...],group2,group3]
    if (typeof choices == "function") { choices = choices(); }
    return choices.map(function(c) {
      if (typeof(c) == "undefined") { return ["","None"]; }
      if (typeof(c) == "string") { return [uR.slugify(c),c];}
      return c;
    });
  };
  riot.mixin({
    init: function() {
      this.opts.onUnmount && this.on("unmount", this.opts.onUnmount);

      // chrome's annoying autofill doesn't proc a change event
      if (!this.opts.is_ur_input) { return; }
      this.field = this.opts.field;
      this.on("mount",function() {
        setTimeout(()=> this.opts.field.reset(),0);
      });
    }
  });
  uR.form.URForm = class URForm {
    constructor(ur_form) {
      this.form_tag = ur_form;
      this.opts = ur_form.opts;
      this.messages = [];
      uR.schema.prepSchema(this);
    }
    postMount() {
      this.opts.onload && this.opts.onload.bind(this)();
      this.active = true; // form can now show errors
    }
  };
})();
