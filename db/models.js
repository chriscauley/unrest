(function() {
  class Model {
    constructor(opts) {
      opts = opts || {};
      this.options = opts;
      this.META = {
        app_label: this.options.app_label,
        db_table: this.options.db_table
      };
      this.create_fields();
      this.objects = this.constructor.objects;
    }
    __str() {
      return this.constructor.verbose_name + " #" + this.id;
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
          editable: false,
        });
      }
    }
    alertForm() {
      uR.alertElement("ur-form",{
        schema: this.getSchema(),
        submit: function() {},
      })
    }
    getSchema() {
      return this.META.fields.filter(f => f.editable).map(field => field.toSchema());
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
      if (field.primary_key) {
        this.META.pk_field = field.name
        this.pk = this[this.META.pk_field];
      }
    }
    save() {
      var is_new = !this.pk;
      this.pk = this.pk || this.objects._getNextPK();
      this[this.META.pk_field] = this.pk;
      this.objects.storage.set(this.pk,this.toJson());
      is_new && this.objects._addPK(this.pk);
      return this;
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
    constructor(model) {
      this.model = model;
      this.NOT_FOUND = model.constructor.name + " not found";
      this.MULTIPLE_OBJECTS_RETURNED = "Get query for " + model.constructor.name + " returned multiple objects";
      this.META = {
        app_label: model.app_label,
        db_table: model.db_table,
      };
      this.storage_key = this.META.app_label + "/" + this.META.db_table + "/";
      if (!uR.db[this.storage_key]) { uR.db[this.storage_key] = new uR.Storage(this.storage_key); }
      this.storage = uR.db[this.storage_key];
    }
    remove(pk) {
      this.storage.remove(this.pk);
      var pks = this._getPKs();
      pks.splice(pks.indexOf(pk),1);
      this.storage.set("INDEX",pks);
    }
    _get(pk) {
      if (typeof pk != "number") { pk = parseInt(pk) }
      if (this._getPKs().indexOf(pk) == -1) { throw this.NOT_FOUND }
      return new this.model(this.storage.get(pk));
    }
    get(options) {
      if (typeof options == 'number' || typeof options == "string") { return this._get(options); }
      else {
        var results = this.filter(options);
        if (!results.length) { throw this.NOT_FOUND }
        if (results.length > 1) { throw this.MULTIPLE_OBJECTS_RETURNED }
        return results[0];
      }
    }
    getOrCreate(options) {
      try {
        return this.get(options);
      } catch (e) {
        if (e == this.NOT_FOUND) { return this.create(options); }
        throw e;
      }
    }
    create(options) {
      return new this.model(options,{save: true}).save();
    }
    filter(options) {
      options = options || {};
      var all = this.all();
      for (var key in options) {
        all = all.filter(function(obj) { return obj[key] == options[key]  })
      }
      return all;
    }
    all() {
      return this._getPKs().map(this._get.bind(this));
    }
    count() {
      return this._getPKs().length;
    }
    _getPKs() {
      return this.storage.get("INDEX") || [];
    }
    _getNextPK() {
      var pks = this._getPKs();
      if (!pks.length) { return 1 }
      return Math.max.apply(this,pks) + 1;
    }
    _addPK(pk) {
      var pks = this._getPKs();
      pks.push(pk)
      this.storage.set("INDEX",pks);
    }
    clear() {
      this.storage.clear();
    }
  }

  window.uR = window.uR || {};
  uR.db = {
    Model: Model,
    ModelManager: ModelManager,
    models: {},
    apps: [],
    getApp: function(app_label) {
      if (!uR.db[app_label]) { throw uR.NotImplemented(`App "${app_label}" not found`) }
      return uR.db[app_label];
    },
    getModel: function(app_label, model_name) {
      var app = uR.db.getApp(app_label);
      if (!app[model_name]) { throw uR.NotImplemented(`Model "${model_name}" not found in app "${app_label}"`) }
      return app[model_name];
    },
    register: function(app_label, models) {
      uR.db[app_label] = uR.db[app_label] || {
        _models: [],
        name: app_label,
        verbose_name: uR.unslugify(app_label),
      };
      var app = uR.db[app_label];
      (uR.db.apps.indexOf(app) == -1) && uR.db.apps.push(app);
      uR.forEach(models,function(model) {
        app[model.name] = model;
        model.prototype.toString = function() {
          return this.__str();
        };
        model.verbose_name = uR.reverseCamelCase(model.name);
        app._models.push(model);
        model.app_label = app_label;
        model.db_table = "__db_"+model.name;
        model.objects = new uR.db.ModelManager(model);
      });
    },
  }
})()
