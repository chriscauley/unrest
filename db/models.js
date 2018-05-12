(function() {
  class QueryError extends Error {
    constructor(message,model,filters) {
      console.error(model.name,filters);
      super(message);
    }
  }
  class Model {
    constructor(opts={}) {
      opts.schema = opts.schema || uR.db.schema[this.constructor.name];
      function cloneObject(obj) { // move int ur? switch to underscore? this probably doesn't need to be deep
        var clone = {};
        for(var i in obj) {
          clone[i] = (obj[i] != null &&  typeof(obj[i])=="object")?cloneObject(obj[i]):clone[i] = obj[i];
        }
        return clone;
      }
      opts.schema = opts.schema.map(cloneObject);
      if (opts.values_list) {
        var [id,..._values] = opts.values_list;
        for (var i in opts.schema) {
          opts.schema[i].value = _values[i];
        }
      }
      this.options = opts;
      this.META = {
        app_label: this.constructor.app_label,
        db_table: this.constructor.db_table
      }
      this.create_fields();
      this.objects = this.constructor.objects;
      if (opts.values_list) {
        this.pk = this[this.META.pk_field] = id;
        if (this.objects._getPKs().indexOf(this.pk) == -1) {
          this.objects._addPK(this.pk);
          this.save();
        }
      }
    }
    getAdminExtra() {}
    __str() {
      return this.constructor.verbose_name + " #" + this.id;
    }
    create_fields() {
      var primary_key;
      this.META.fields = [];
      this.options.schema.map(this.prepField,this);
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
    edit() {
      path = "#!/"+['admin',this.META.app_label,this.constructor.name,this.id].join("/")+"/";
      uR.route(path);
    }
    getSchema() {
      var self = this;
      return this.META.fields.filter(f => f.editable).map(field => field.toSchema(self[field.name]));
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
      field.setValue(this,field.value);
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
        out[field.name] = field.toJson(this[field.name]);
      }.bind(this));
      return out;
    }
    delete() {
      this.objects.remove(this.objects.storage_key+this.pk);
    }
  }

  class ModelManager {
    constructor(model) {
      var self = this;
      this.model = model;
      this.model.NotFound = this.NotFound = class NotFound extends QueryError {
        constructor(filters) {
          super(model.name + " not found",model,filters)
        }
      }
      class MultipleObjectsReturned extends QueryError {
        constructor(filters) {
          super("Get query for " + model.name + " returned multiple objects",model,filters);
        }
      }
      this.MultipleObjectsReturned = this.model.MultipleObjectsReturned = MultipleObjectsReturned;
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
      if (this._getPKs().indexOf(pk) == -1) { throw new this.NotFound({pk: pk}) }
      return new this.model(this.storage.get(pk));
    }
    get(options) {
      if (typeof options == 'number' || typeof options == "string") { return this._get(options); }
      else {
        var results = this.filter(options);
        if (!results.length) { throw new this.NotFound(options) }
        if (results.length > 1) { throw new this.MultipleObjectsReturned(options) }
        return results[0];
      }
    }
    getOrCreate(options) {
      try {
        return this.get(options);
      } catch (e) {
        if (e instanceof this.NotFound) { return this.create(options); }
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
        var value = options[key];
        value = value && value.pk || value;
        all = all.filter(function(obj) {
          var obj_value = obj[key];
          obj_value = obj_value && obj_value.pk || obj_value;
          return obj_value == value;
        });
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
    _addPK(pk) { // #! TODO this should use a set
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
    schema: {},
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
        uR.db.models[app.name+"."+model.name] = app[model.name] = model;
        model.prototype.toString = function() {
          return (this.id && this.__str()) || `Unsaved ${this.constructor.verbose_name }`;
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
