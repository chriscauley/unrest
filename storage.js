uR = window.uR || {};
uR.storage = (function() {
  function get(key) {
    var value;
    if (localStorage.hasOwnProperty(key)) {
      value = JSON.parse(localStorage.getItem(key));
    } else if (uR.storage.defaults.hasOwnProperty(key)) {
      value = uR.storage.defaults[key];
    }
    return value
  }
  function set(key,value) {
    localStorage.setItem(key,JSON.stringify(value))
  }
  return {
    get: get,
    set: set,
    lookups: {}, // functions to look up missing/expired values
    defaults: {}, // table with default values
  }
})();
