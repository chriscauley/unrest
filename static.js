(function() {
  uR.static = function(s) {
    if (s[0] == "/" || s.match(/^http/)) { return s; }
    return uR.config.STATIC_URL+s;
  }
  uR.config.STATIC_URL = "/";
})();
