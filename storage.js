uR = window.uR || {};
uR.storage = (function() {
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
    if (! value) { localStorage.removeItem(key); return; }
    localStorage.setItem(key,JSON.stringify(value))
  }

  try {
    storage.setItem('test', '1');
    storage.removeItem('test');
  } catch(e) {
    var FAKE_STORAGE = {};
    function set(key,value) { FAKE_STORAGE[key] = value }
    function get(key) { return FAKE_STORAGE[key]; }
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

  return {
    get: get,
    set: set,
    lookups: {}, // functions to look up missing/expired values
    defaults: {}, // table with default values
    remote: remote,
    default_expire_ms: 60*1000, // assume data expires in 1 minutes
  }
})();
