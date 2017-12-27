class Model {
  constructor(opts) {
    opts = opts || {};
    this.storage = uR.db.storage;
    this.META = {};
    this.options = opts;
    uR.defaults(this.options,{});
    this.create_fields();
    !this[this.META.pk_field] && this.create_pk();
  }
  create_pk() {
    this.pk = (this.storage.get(this.constructor.name+"/__pk") || 0) + 1;
    this.storage.set(this.constructor.name+"/__pk",this.pk)
  }
  create_fields() {
    var primary_key;
    this.META.fields = [];
    for (var i=0;i<this.options.schema.length;i++) {
      this.prepField(this.options.schema[i]);
    }
  }
  prepField(options) {
    if (typeof options == "string") {
      var name = options;
      if (uR.schema.fields[options]) {
        options = uR.schema.fields[options];
        options.name = name;
      } else {
        options = { name: name, type: 'text' }
      }
    }
    var field_class = options.field_class || uR.db.fields_map[options.type] || uR.db.CharField;
    options.parent = this;
    var field = new field_class(options);
    if (this[field.name]) { throw "Field cannot have name that already exists on parent model" }
    this.META.fields.push(field);
    this[field.name] = field.value;
    if (field.primary_key) { this.META.pk_field =field.name }
  }
}
window.uR = window.uR || {};
uR.db = {
  Model: Model,
}
uR.ready(function() { uR.db.storage = new uR.Storage('db'); });
