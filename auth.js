(function() {
  uR.auth = uR.auth || {};
  uR.auth.loginRequired = function loginRequired(func,data) {
    if (typeof func == "string") {
      var tag_name = func+"";
      func = function(path,options) { uR.mountElement(tag_name,options) }
    }
    data = data || {};
    return function() {
      var args = arguments;
      function success(data) {
        if (data) { uR.auth.user = data.user; }
        func.apply(this,args);
        var tag = document.querySelector("auth-login");
        tag && tag.parentNode.removeChild(tag);
      }
      if (!uR.auth.user || data.force) {
        data.success = data.success || success;
        data.canccel_next = data.cancel_next || "/";
        data.modal_class = data.modal_class || "signin";
        uR.auth.startLogin(data);
      }
      else { success(); }
    }
  }
  uR.auth.startLogin = function startLogin(data) {
    data = data || {};
    data.modal_class = data.modal_class || "signin";
    var parent = document.getElementById("alert-div");
    var t = uR.auth.login_template || "auth-login";
    if (!document.querySelector(t)) { document.body.appendChild(document.createElement(t)); }
    riot.mount(t, data);
  }
})()
