(function() {
  class Storage {
    constructor(prefix) {
      this.PREFIX = prefix || "";
      this.META = this.PREFIX + "META/";
      this.EXIPIRY = '__expiry/'; // Key used for expiration storage
      this.default_expire_ms = 10*60*1000; // ten minutes
      this.defaults = {}; // table with default values
      this.times = {};
      if (!this.test_supported()) {
        console.warn("Storage not supported, falling back to dummy storage");
        this.FAKE_STORAGE = {};
        this.set = function(key,value) { this.FAKE_STORAGE[key] = value; }
        this.get = function(key) { return this.FAKE_STORAGE[key]; }
        this.has = function(key) { this.FAKE_STORAGE.hasOwnProperty(key); }
        this.remove = function(key) { delete this.FAKE_STORAGE[key]; }
      }
      //this.times = this.get(this.META+"times") || {};
    }

    get(k) {
      // pull a json from local storage or get an object from the defaults dict
      var key = this.PREFIX+k;
      var value;
      if (localStorage.hasOwnProperty(key)) {
        try { value = JSON.parse(localStorage.getItem(key)); }
        catch(e) { } // we only allow JSON here, so parse errors can be ignored
      } else if (this.defaults.hasOwnProperty(key)) {
        value = this.defaults[key];
      }
      return value
    }

    set(k,value) {
      // store stringified json in localstorage
      var key = this.PREFIX+k;
      if (!value && value !== 0) { localStorage.removeItem(key); return; }
      localStorage.setItem(key,JSON.stringify(value))
      this.times[key] = new Date().valueOf();
      this._saveTime()
    }
    has(key) { return localStorage.hasOwnProperty(key) }

    remove(k) {
      var key = this.PREFIX+k;
      localStorage.removeItem(key);
      delete this.times[key];
      this._saveTime()
    }

    _saveTime() {
      localStorage.setItem(this.META+'times',JSON.stringify(this.times));
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
      epoch_ms = epoc_ms || this.default_expire_ms + new Date().valueOf();
      set(this.EXPIRY+key,epoch_ms);
      return epock_ms;
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
        }
      });
    }
  }

  uR.storage = new Storage();
  uR.Storage = Storage;
})();
