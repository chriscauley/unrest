(function() {
  class Storage {
    constructor(prefix) {
      this.PREFIX = prefix || "";
      this.META = "META/";
      this.EXIPIRY = '__expiry/'; // Key used for expiration storage
      this.default_expire_ms = 10*60*1000; // ten minutes
      this.defaults = {}; // table with default values
      this._schema = {};
      this.__CACHE = {};
      if (!this.test_supported()) {
        console.warn("Storage not supported, falling back to dummy storage");
        this.FAKE_STORAGE = {};
        this.set = function(key,value) { this.FAKE_STORAGE[key] = value; };
        this.get = function(key) { return this.FAKE_STORAGE[key]; };
        this.has = function(key) { this.FAKE_STORAGE.hasOwnProperty(key); };
        this.remove = function(key) { delete this.FAKE_STORAGE[key]; };
      }
      this.times = this.get(this.META+"times") || {};
      this.keys = this.get(this.META+"keys") || [];
    }

    _(key) { return this.PREFIX + key; }
    _getItem(key) {
      if (this.__CACHE[key] === undefined) {
        this.__CACHE[key] = localStorage.getItem(this._(key));
      }
      return this.__CACHE[key];
    }
    _setItem(key,value) {
      localStorage.setItem(this._(key),this.__CACHE[key] = value);
    }
    _removeItem(key) { return localStorage.removeItem(this._(key)); }
    _hasOwnProperty(key) { return localStorage.hasOwnProperty(this._(key)); }

    get(key) {
      // pull a json from local storage or get an object from the defaults dict
      var value;
      if (this._hasOwnProperty(key)) {
        try { value = JSON.parse(this._getItem(key)); }
        catch(e) { console.warn(`Item "${key}" in uR.Storage was not JSON`,value); }
      } else if (this.defaults.hasOwnProperty(key)) {
        value = this.defaults[key];
      }
      return value;
    }

    update(data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) { this.set(key,data[key]); }
      }
    }

    set(key,value) {
      // store stringified json in localstorage
      if (!value && value !== 0 && value !== "") { return this.remove(key); }
      this._setItem(key,JSON.stringify(value));
      this.times[key] = new Date().valueOf();
      (this.keys.indexOf(key)==-1)?this.keys.push(key):undefined;
      this._save();
    }
    has(key) { return this.keys.indexOf(key) != -1; }

    remove(key) {
      // note, removing a key will revert to default (if present), not undefined
      this._removeItem(key);
      this.keys = this.keys.filter((k) => k != key );
      delete this.times[key];
      this._save();
    }

    clear() {
      for (var key in this.times) { this.remove(key); }
      this._save();
    }

    _save() {
      this._setItem(this.META+'times',JSON.stringify(this.times));
      this._setItem(this.META+'keys',JSON.stringify(this.keys));
    }

    test_supported() {
      // incognito safari and older browsers don't support local storage. Use an object in ram as a dummy
      try {
        localStorage.setItem('test', '1');
        localStorage.removeItem('test');
        return true;
      } catch(e) { console.warn("No local storage found. Falling back."); }
    }

    // below this is the api for the timebomb remote data store, which isn't used anywhere yet.
    // a dummy version of this would just allways execute a remote lookup and then callback.
    isExpired(key) {
      var expire_ms = this.get(this.EXPIRY+key) || this.setExpire(key);
      return expire_ms < new Date().valueOf();
    }
    setExpire(key,epoch_ms) {
      epoch_ms = epoch_ms || this.default_expire_ms + new Date().valueOf();
      this.set(this.EXPIRY+key,epoch_ms);
      return epoch_ms;
    }
    remote(url,callback) {
      var stored = this.get(url);
      if (stored && !this.isExpired(url)) { callback(stored); return; }
      uR.ajax({
        url: url,
        success: function(data) {
          this.set(url,data);
          this.setExpire(url);
          callback(data);
        }.bind(this),
      });
    }
  }

  uR._configs = [];
  class Config extends Storage {
    constructor(prefix,schema) {
      super(prefix);
      uR._configs.push(this);
      uR._configs[prefix] = this;
      schema && this.setSchema(schema);
    }
    getDefault(key,_default,schema) {
      if (!schema || typeof schema == "string") { schema = { type: schema, _default:_default }; }
      if (schema && !this._schema[key]) {
        this._schema[key] = schema || {};
        this._schema[key].name = key;
      }
      if (_default && ! this.defaults[key]) {
        this.defaults[key] = _default;
        !this.has(key) && this.set(key,_default);
      }
      return this.get(key) || _default;
    }
    get(key) {
      var out = super.get(key);
      var type = this._schema[key] && this._schema[key].type;
      if (type == "boolean") { return out == "true"; }
      if (type == "int" || type == "integer") { return parseInt(out); }
      if (type == "float") { return parseFloat(out); }
      return out;
    }
    getSchema(keys) {
      var self = this;
      return this._getSchemaKeys(keys).map(key => (self._schema[key] || key) );
    }

    setSchema(schema) {
      var self = this;
      // #! TODO: detect type and set to int/bool/char. Maybe if value is object extend object
      if (!Array.isArray(schema)) {// assume it's name/value object
        var obj = schema;
        schema = [];
        for (var key in obj) {
          schema.push({ name: key, value: obj[key] });
        }
      }
      uR.forEach(schema,function(s) {
        if (s.type == "color" && tinycolor) { s.initial = tinycolor(s.initial).toHexString(); }
        self.getDefault(s.name,s._default || s.value,s);
      });
      return this.getSchema();
    }

    _getSchemaKeys(keys) {
      var out = [];
      for (var key in this._schema) {
        if (keys && keys.indexOf(key) == -1) { continue; }
        this._schema.hasOwnProperty(key) && out.push(key);
      }
      return out;
    }
    getData(keys) {
      var out = {};
      var self = this;
      uR.forEach(this._getSchemaKeys(keys),(key) => out[key] = self.get(key));
      return out;
    }

    openEditor(tag_opts) {
      var self=this, dirty;
      var opts = {
        schema: self.getSchema(),
        submit: function (riot_tag) {
          self.update(riot_tag.getData());
          dirty = true;
        },
        autosubmit: true,
        onUnmount: function() {
          tag_opts && tag_opts.cancel && tag_opts.cancel();
          dirty && window.location.reload();
        },
      };
      uR.forEach(opts.schema,(s)=> {
        s._default = s.value;
        s.value = self.get(s.name);
      });
      uR.alertElement("ur-form",opts);
    }    
  }

  uR.Config = Config;

  uR.storage = new Storage();
  uR.Storage = Storage;
})();
