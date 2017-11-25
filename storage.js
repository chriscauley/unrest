(function() {
  class Storage {
    constructor(prefix) {
      this.PREFIX = prefix || "";
      this.META = "META/";
      this.EXIPIRY = '__expiry/'; // Key used for expiration storage
      this.default_expire_ms = 10*60*1000; // ten minutes
      this.defaults = {}; // table with default values
      if (!this.test_supported()) {
        console.warn("Storage not supported, falling back to dummy storage");
        this.FAKE_STORAGE = {};
        this.set = function(key,value) { this.FAKE_STORAGE[key] = value; }
        this.get = function(key) { return this.FAKE_STORAGE[key]; }
        this.has = function(key) { this.FAKE_STORAGE.hasOwnProperty(key); }
        this.remove = function(key) { delete this.FAKE_STORAGE[key]; }
      }
      this.times = this.get(this.META+"times") || {};
      this.keys = this.get(this.META+"keys") || [];
    }

    _(key) { return this.PREFIX + key; }
    _getItem(key) { return localStorage.getItem(this._(key)); }
    _setItem(key,value) { return localStorage.setItem(this._(key),value); }
    _removeItem(key) { return localStorage.removeItem(this._(key)); }
    _hasOwnProperty(key) { return localStorage.hasOwnProperty(this._(key)) }

    get(key) {
      // pull a json from local storage or get an object from the defaults dict
      var value;
      if (this._hasOwnProperty(key)) {
        try { value = JSON.parse(this._getItem(key)); }
        catch(e) { } // we only allow JSON here, so parse errors can be ignored
      } else if (this.defaults.hasOwnProperty(key)) {
        value = this.defaults[key];
      }
      return value
    }

    set(key,value) {
      // store stringified json in localstorage
      if (!value && value !== 0) { localStorage.removeItem(key); return; }
      this._setItem(key,JSON.stringify(value))
      this.times[key] = new Date().valueOf();
      this.keys.push(key);
      this._save();
    }
    has(key) { return this.keys.indexOf(key) != -1 }

    remove(key) {
      this._removeItem(key);
      this.keys = this.keys.filter(function(k) { k != key });
      delete this.times[key];
      this._save();
    }

    clear() {
      for (var key in this.times) { localStorage.setItem(key,null); delete this.times[key]; }
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
      } catch(e) { }
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
      if (stored && !this.isExpired(url)) { callback(stored); return }
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

  uR.storage = new Storage();
  uR.Storage = Storage;
})();
