(function() {
  uR.auth = uR.auth || {};
  uR.auth.loginRequired = function loginRequired(func,data) {
    if (typeof func == "string") {
      var tagname = func;
      func = function(path,data) {
        uR.mountElement(tagname,data)
      }
    }
    data = data || {};
    function wrapped() {
      var args = arguments;
      function success(data) {
        if (data) { uR.auth.setUser(data.user); }
        func.apply(this,args);
      }
      if (!uR.auth.user || data.force) {
        uR.AUTH_SUCCESS = success;
        data.slug = "register";
        uR.alertElement("auth-modal",data);
      }
      else { success(); }
    }
    wrapped.login_required = true;
    return wrapped;
  }
  uR.auth.setUser = function setUser(user) {
    uR.storage.set('auth.user',user || null); // JSON.stringify hates undefined
    uR.auth.user = user;
    riot.update(uR.auth.tag_names);
  }
  uR.schema.auth = {
    login: [
      { name: 'username', label: 'Username or Email' },
      { name: 'password', type: 'password' },
    ],
    register: [
      { name: 'email', label: 'Email Address', type: "email" },
      { name: 'password', type: 'password' },
    ],
    'password-reset': [ { name: 'email', label: 'Email Address', type: "email" }, ]
  };
  uR.urls.auth = {
    login: "/auth/login/"
  }
  uR.urls.api = uR.urls.api || {};
  uR.urls.api.login = "/api/login/";
  uR.urls.api.register = "/api/register/";
  uR.urls.api['password-reset'] = "/api/password-reset/";
  uR.auth.tag_names = 'auth-dropdown';
  uR._routes["/auth/(login|register|forgot-password)/"] = function(path,data) {
    uR.alertElement("auth-modal",data);
  }

  uR.auth.user = uR.storage.get("auth.user");
  uR.ready(function() {
    riot.mount(uR.auth.tag_names);
    uR.ajax({
      url: "/user.json",
      success: function(data) {
        if (data.user != uR.auth.user) { uR.auth.setUser(data.user); }
      },
    });
  });
})()
