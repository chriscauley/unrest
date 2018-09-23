uR.schema = uR.schema || {};

uR.schema.prepSchema = (form) => {
  var tag = form.form_tag;
  var _schema = tag.opts.schema || tag.parent && tag.parent.opts.schema || tag.parent.schema;
  if (_schema instanceof Map) { _schema = Array.from(_schema.values()); }
  form.action = tag.opts.action;
  if (typeof _schema == "string") {
    form.schema_url = _schema;
    form.action = form.action || form.schema_url;
    if (uR.schema[form.schema_url]) {
      _schema = uR.schema[form.schema_url];
    } else {
      var url = _schema;
      uR.getSchema(url,form.prepSchema.bind(form));
      form._needs_update = true;
      _schema = [];
      return;
    }
  }
  if (!_schema) { throw "NotImplemented: ur-form cannot function without schema"; }
  form.empty_initial = uR.schema.__initial[form.schema_url] || form.form_tag.opts.initial || {};
  form.initial = uR.storage.get(form.form_tag.action) || form.empty_initial || {};

  tag.form_title = form.opts.form_title || _schema.form_title;
  tag.rendered_content = _schema.rendered_content;
  form.schema = _schema.map(uR.form.prepField);
  form.field_list = [];
  form.fields = {};
  uR.forEach(form.schema, function(field) {
    var override = uR.config.input_overrides[field.type] || uR.config.name_overrides[field.name];
    // #! TODO: should this take in field and modify it?
    if (typeof override == "function") { override = override(); }
    if (typeof override == "string") { field.tagname = override; }
    else {
      uR.defaults(field,override);
      field.type = override && override.type || field.type;
    }
    field.tagname = field.tagname || "ur-input";
    field._field_index = form.field_list.length;
    var cls = uR.form.fields[field.tagname] || uR.form.fields["ur-input"];
    form.field_list.push(new cls(form,field));
    form.fields[field.name] = form.field_list[form.field_list.length-1];
  }.bind(form));
  if (form.opts.post_render) {
    form.opts.post_render(form);
    form.needs_update = true;
  }
  if (form._needs_update) {
    form.form_tag.update();
    form.form_tag.update();
  }
};

uR.schema.prepFieldOptions = (opts) => {
  if (typeof opts == "string") {
    var name = opts;
    if (uR.schema.fields[opts]) {
      opts = uR.schema.fields[opts];
      opts.name = name;
    } else {
      opts = { name: name, type: 'text' };
    }
  }
  opts.required = opts.required == undefined || opts.required; // defaults to true!
  opts.name = opts.name || opts.type;
  if (typeof(opts.name) == "object") { // can't remember when this is used
    console.warn("look at me!");
    opts.name = (typeof(opts.name) == "object")?opts.name[0]:opts.name;
  }

  if (opts.value === false) { opts.value = uR.FALSE; }
  if (opts.value === undefined && opts.form.initial) { opts.value = opts.form.initial[opts.name]; }
  opts.initial_value = opts.value
  if (opts.type == "datetime-local" && typeof opts.value == "string") {
    // the HTML input type is very picky about the format, so use moment to coerce it
    // empty string remains empty string
    opts.value = opts.initial_value = opts.value && moment(opts.value).format("YYYY-MM-DDTHH:mm");
  }

  // verbose_name is useful for error messages, other generated text
  opts.verbose_name = opts.verbose_name || opts.label || opts.placeholder;
  if (!opts.verbose_name) { // #! TODO: I think this is just unslugify
    var replace = function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();};
    opts.verbose_name = (opts.name || "").replace(/[-_]/g," ").replace(/\w\S*/g, replace);
  }

  opts.label = opts.label || opts.verbose_name;
  if (!opts.id) {
    opts.id = "id_" + opts.name + (opts.form && opts.form.form_tag.suffix || "");
  }

  // input_tagname and input_type are used in generating the <input>
  opts.input_tagname = opts.input_tagname || ((opts.type == "textarea")?opts.type:"input");
  opts.input_type = opts.type || "text";
  opts.className = opts.name + " " + opts.type + " " + uR.css.form.field;

  if (opts.choices) {
    opts.choices_map = {};
    opts.choices = uR.form.parseChoices(opts.choices).map((choice_tuple,index) => {
      opts.choices_map[choice_tuple[0]] = choice_tuple[1];
      return {
        label: choice_tuple[1],
        id: opts.id+"__"+index,
        value: uR.slugify(choice_tuple[0]),
      };
    });
  }
  return opts;
};
