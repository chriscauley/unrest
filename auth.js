(function() {
  uR.auth = uR.auth || {};
  uR.auth.loginRequired = function loginRequired(func,data) {
    data = data || {};
    return function() {
      var args = arguments;
      function success() { func.apply(this,args); }
      if (!uR.auth.user || data.force) {
        data.success = data.success || success;
        data.canccel_next = data.cancel_next || "/";
        data.modal_class = data.modal_class || "signin";
        uR.auth.showSignin(data);
      }
      else { success(); }
    }
  }
  uR.auth.startLogin = function startLogin(data) {
    data = data || {};
    data.modal_class = data.modal_class || "signin";
    var parent = document.getElementById("alert-div");
    var t = uR.auth.login_template || "auth-login";
    if (!document.querySelector(t)) { document.body.appendChild(document.createElement()); }
    riot.mount(t, data);
  }
})()