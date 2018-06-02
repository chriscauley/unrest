(function() {
  class QueryError extends Error {
    constructor(message,model,filters) {
      console.error(model.name,filters);
      super(message);
    }
  }
  class Model {
    constructor(opts={}) {
      this.META = {
        app_label: this.constructor.app_label,
        db_table: this.constructor.db_table,
        model_name: this.constructor.name,
        model_key: this.constructor.model_key,
      }
      this.options = opts;
      this.createSchema();
      this.create_fields();
      this.objects = this.constructor.objects;
      if (this.options._is_api) {
        this.form_action = "/api/schema/"+this.META.model_key+"Form/";
        if (this._pk) { this.form_action += this._pk+"/"; }
      }
      if (this._pk) {
        this.pk = this[this.META.pk_field] = this._pk;
        this.save();
      }
    }
    createSchema() {
      // returns a list of objects to be used by a <ur-form>
      var _schema = uR.db.schema[this.META.model_key];
      this.schema = new Map();
      _schema.map(obj => this.schema.set(obj.name,uR.clone(obj)));
      if (this.options.values_list) {
        var [id,..._values] = this.options.values_list;
        this._pk = id;
        var iter = this.schema.values();
        var self = this;
        uR.forEach(_values,function(v,i) {
          var field = iter.next().value;
          field.value=v;
        })
      }
      return this.schema;
    }
    getAdminExtra() {}
    __str() {
      return this.constructor.verbose_name + " #" + this.id;
    }
    create_fields() {
      var primary_key;
      this.META.fields = [];
      this.schema.forEach(this.prepField,this);
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
    getAdminUrl() {
      var url = this.constructor.admin_url;
      if (this.pk) { url += this.pk+"/" }
      return url;
    }
    edit() {
      uR.route(this.getAdminUrl());
    }
    // #! this was used in admin, maybe also in other apps. Depracated in favor of this.schema and this.createSchema
    // getSchema() {
    //   var self = this;
    //   return this.META.fields.filter(f => f.editable).map(field => field.toSchema(self[field.name]));
    // }
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
        this.pk = this[field.name];
      }
    }
    save() {
      return this.objects.save(this);
    }
    toJson() {
      var out = {};
      uR.forEach(this.META.fields,function(field) {
        out[field.name] = field.toJson(this[field.name]);
      }.bind(this));
      return out;
    }
    delete() {
      this.objects.delete(this)
    }
  }

  // Might be better as a uR.db.Field or a mixin
  class DataModel extends Model {
    constructor(opts={}) {
      super(opts);
    }
    createDataFields() {
      this.data_fields = [];
    }
    createSchema() {
      // add this.data_fields to this.schema
      super.createSchema();
      this.createDataFields();
      this.data_values = this.schema.has("data") && this.schema.get("data").value || {};
      this.schema.delete("data");
      uR.forEach(this.data_fields,function(f) {
        f.value = f.value || this.data_values[f.name];
        this.schema.set(f.name,f);
      },this);
    }
    toJson(out) {
      var out = out || super.toJson();
      out.data = {};
      uR.forEach(this.data_fields,function(field) {
        out.data[field.name] = out[field.name];
        delete out[field.name];
      },this)
      return out;
    }
  }

  class BaseModelManager {
    constructor(model) {
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
    }
    remove(pk) { throw "NotImplemented" }
    all() { throw "NotImplemented" }
    save(obj) { throw "NotImplemented" }
    count() { throw "NotImplemented" }
    clear() { throw "NotImplemented" }
    _get(options) { throw "NotImplemented" }
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
  }

  class StorageModelManager extends BaseModelManager {
    constructor(model) {
      super(model)
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
    save(obj) {
      var is_new = !obj.pk || (this._getPKs.indexOf(obj.pk) == -1);
      obj[obj.META.pk_field] = obj.pk = obj.pk || this._getNextPK();
      this.storage.set(obj.pk,obj.toJson());
      is_new && obj.objects._addPK(obj.pk);
      return obj;
    }
    delete(obj) {
      obj.remove(this.storage_key+obj.pk);
    }
  }

  class MapModelManager extends BaseModelManager {
    // Stores objects in navtive Map type.
    // WARNING: Storage is non-persistent
    constructor(model) {
      super(model);
      this.storage = new Map();
    }
    save(obj) {
      if (!obj.pk) { throw "NotImplemented"; }
      this.storage.set(obj.pk,obj);
      return obj;
    }
    clear() { this.storage.clear() }
    delete(obj) { this.storage.delete(obj.id) }
    all() { return Array.from(this.storage.values()) }
    count() { return this.storage.size }
    _get(pk) {
      if (typeof pk != "number") { pk = parseInt(pk) }
      var obj = this.storage.get(pk);
      if (!obj) { throw new this.NotFound({pk: pk}) }
      return obj
    }
  }

  window.uR = window.uR || {};
  uR.db = {
    Model: Model,
    DataModel: DataModel,
    ModelManager: StorageModelManager, // Override this to choose alternate storages
    StorageModelManager: StorageModelManager,
    MapModelManager: MapModelManager,
    BaseModelManager: BaseModelManager,
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
        model.model_key = app_label+"."+model.name;
        model.objects = new uR.db.ModelManager(model);
        model.admin_url = "#!/admin/"+app_label+"/"+model.name+"/";
        model.admin_new_url = model.admin_url+"new/";
      });
    },
  }
})()
