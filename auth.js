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
    uR.auth.postAuth();
    riot.update(uR.auth.tag_names);
  }
  uR.auth.postAuth = function() {}
  uR.auth._getLinks = function() {
    return [
      {url: "/account/settings/", icon: "gear", text: "Account Settings"},
      {url: "/auth/logout/", icon: "sign-out", text: "Log Out"},
    ];
  }
  uR.auth.getLinks = uR.auth._getLinks;

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
  uR.addRoutes({
    "/auth/(login|register|forgot-password)/": function(path,data) { uR.alertElement("auth-modal",data); },
    "/auth/logout/": function(path,data) {
      uR.auth.setUser(null);
      window.location = "/accounts/logout/";
    },
  });

  uR.auth.user = uR.storage.get("auth.user");
  uR.ready(function() {
    riot.mount(uR.auth.tag_names);
    uR.auth.reset();
  });
  uR.auth.reset = function(callback) {
    callback = callback || function() {}
    uR.ajax({
      url: "/user.json",
      success: function(data) {
        if (data.user != uR.auth.user) { uR.auth.setUser(data.user); }
        callback()
      },
    });
  }
})()
