(function() {
  // basic functions
  function get(key) {
    var value;
    if (localStorage.hasOwnProperty(key)) {
      try { value = JSON.parse(localStorage.getItem(key)); }
      catch(e) { }
    } else if (uR.storage.defaults.hasOwnProperty(key)) {
      value = uR.storage.defaults[key];
    }
    return value
  }
  function set(key,value) {
    if (!value && value !== 0) { localStorage.removeItem(key); return; }
    localStorage.setItem(key,JSON.stringify(value))
    uR.storage.times[key] = new Date().valueOf();
    localStorage.setItem('times',JSON.stringify(uR.storage.times));
  }
  function has(key) { return localStorage.hasOwnProperty(key) }

  function remove(key) {
    localStorage.removeItem(key);
    delete uR.storage.times[key];
    localStorage.setItem('times',JSON.stringify(uR.storage.times));
  }

  try {
    localStorage.setItem('test', '1');
    localStorage.removeItem('test');
  } catch(e) {
    function set(key,value) { uR.storage.FAKE_STORAGE[key] = value }
    function get(key) { return uR.storage.FAKE_STORAGE[key]; }
    function has(key) { uR.storage.FAKE_STORAGE.hasOwnProperty(key); }
    function remove(key) { delete uR.storage.FAKE_STORAGE[key]; }
  }

  // timebomb remote data store
  var __expiry = '__expiry'; // Key used for expiration storage
  function isExpired(key) {
    var expire_ms = get(__expiry+key);
    if (!expire_ms) { setExpire(key); }
    return expire_ms && expire_ms < new Date().valueOf();
  }
  function setExpire(key,epoch_ms) {
    if (!epoch_ms) { epoch_ms = uR.storage.default_expire_ms + new Date().valueOf() }
    set(__expiry+key,epoch_ms);
  }
  function remote(url,callback) {
    var stored = get(url);
    if (stored && !isExpired(stored)) { callback(stored); return }
    uR.ajax({
      url: url,
      success: function(data) {
        set(url,data);
        setExpire(url);
        callback(data);
      }
    });
  }

  uR.storage = {
    get: get,
    set: set,
    has: has,
    remove: remove,
    FAKE_STORAGE: {},
    lookups: {}, // functions to look up missing/expired values
    defaults: {}, // table with default values
    remote: remote,
    default_expire_ms: 60*1000, // assume data expires in 1 minutes
  }
  uR.storage.times = uR.storage.get("times") || {};
})();
