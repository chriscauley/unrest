uR.db.BaseField = class BaseField extends uR.Object {
  constructor(opts) {
    super();
    this.defaults(opts,{
      editable: uR.DEFAULT_TRUE,
    });
    var parent = this.parent || {};
    this.required = this.required == undefined || this.required; // defaults to true!

    this.name = this.name || this.type;
    this.value = this.value || (parent.initial || {})[this.name] || (parent.options || {})[this.name];
    this.initial_value = this.value;
  }
  toSchema(_value) {
    return {
      name: this.name,
      type: this.input_type || this.type,
      value: this.toJson(this.value || this.initial),
      label: this.label,
      choices: this.choices,
    };
  }
  toJson(value) { return value; }
  setValue(obj,value) { obj[this.name] = value; }
};

uR.db.CharField = class CharField extends uR.db.BaseField {

};

uR.db.IntegerField = class IntegerField extends uR.db.BaseField {

};

uR.config.input_overrides.fk = "select-input";

uR.db.ForeignKey = class ForeignKey extends uR.db.BaseField {
  constructor(opts) {
    uR.defaults(opts,{
      to: uR.REQUIRED,
      input_type: "select",
    });
    super(opts);
    var field = this; //this.name = author
    var [fk_app,fk_model] = opts.to.split(".");
    field.fk_model = uR.db.getModel(fk_app,fk_model); //Author
    opts.related_name = opts.related_name || field.parent.constructor.name.toLowerCase()+"_set";
    field.fk_model.prototype[opts.related_name] = function(opts={}) { //Author.book_set
      opts[field.name] = this.pk; // this is an Author instance
      return field.parent.constructor.objects.filter(opts);
    };
  }
  toJson(value) {
    return value && value.pk || value;
  }
  toSchema(value) {
    var out = super.toSchema(value);
    out.choices = this.fk_model.objects.all().map((obj) => [obj.id,obj.toString()]);
    return out;
  }
  setValue(obj,value) {
    // sets value of the object to null or the instance of the object
    // #! TODO this should be a property using __defineGetter__
    if (value && !(value instanceof this.fk_model)) {
      value = null || this.fk_model.objects.get(value);
    }
    obj[this.name] = value;
    obj[this.name+"_id"] = null || value && value.id;
  }
};

uR.db.fields_map = {
  'text': uR.db.CharField,
  'int': uR.db.IntegerField,
  'fk': uR.db.ForeignKey,
};
