(function() {
  class Model {
    constructor(opts) {
      opts = opts || {};
      this.storage = uR.db.storage;
      this.options = opts;
      uR.defaults(this.options,{
        app_label: "NO_APP_LABEL",
        db_table: this.constructor.name.toLowerCase(),
      });
      this.META = {
        app_label: this.options.app_label,
        db_table: this.options.db_table
      };
      this.create_fields();
      this.objects = new uR.db.ModelManager(this);
    }
    create_fields() {
      var primary_key;
      this.META.fields = [];
      for (var i=0;i<this.options.schema.length;i++) {
        this.prepField(this.options.schema[i]);
      }
      this.META.pk_field = this.META.pk_field || "id";
      if (!this[this.META.pk_field]) {
        this.prepField({
          name: this.META.pk_field,
          type: 'int',
          primary_key: true,
        });
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
      this.pk = this[this.META.pk_field];
    }
    save() {
      var is_new = !this.pk;
      this.pk = this.pk || Math.ceil(Math.random()*2147483647); // using this number because it's the max int value in sql
      this[this.META.pk_field] = this.pk;
      this.storage.set(this.objects.storage_key+this.pk,this.toJson());
      is_new && this.objects._addPK(this.pk);
    }
    toJson() {
      var out = {};
      uR.forEach(this.META.fields,function(field) {
        out[field.name] = this[field.name];
      }.bind(this));
      return out;
    }
    delete() {
      this.objects.remove(this.objects.storage_key+this.pk);
    }
  }

  class ModelManager {
    constructor(child) {
      this.META = {
        app_label: child.META.app_label,
        db_table: child.META.db_table,
      };
      this.storage = child.storage;
      this.model_class = child.constructor;
      this.storage_key = this.META.app_label + "/" + this.META.db_table + "/";
    }
    remove(pk) {
      this.storage.remove(this.storage_key+this.pk);
      var pks = this._getPKs();
      pks.splice(pks.indexOf(pk),1);
      this.storage.set(this.storage_key + "INDEX",pks);
    }
    get(pk) {
      return new this.model_class(this.storage.get(this.storage_key+pk));
    }
    all() {
      var pks = this._getPKs();
      return pks.map(this.get.bind(this));
   }
    _getPKs() {
      return this.storage.get(this.storage_key + "INDEX") || [];
    }
    _addPK(pk) {
      var pks = this._getPKs();
      pks.push(pk)
      this.storage.set(this.storage_key + "INDEX",pks);
    }
    clear() {
      this.storage.clear();
    }
  }

  window.uR = window.uR || {};
  uR.db = {
    Model: Model,
    ModelManager: ModelManager,
  }
})()
uR.ready(function() { uR.db.storage = new uR.Storage('db'); });
