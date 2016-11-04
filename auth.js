(function() {
  uR.auth = uR.auth || {};
  uR.auth.loginRequired = function loginRequired(func,data) {
    if (typeof func == "string") {
      var tag_name = func+"";
      func = function(path,options) { uR.mountElement(tag_name,options) }
    }
    data = data || {};
    function wrapped(path) {
      if (path && path.startsWith("/auth/") { path = "/"; }
      var args = arguments;
      function success(data) {
        if (data) { uR.auth.setUser(data.user); }
        func.apply(this,args);
      }
      if (!uR.auth.user || data.force) {
        data.success = data.success || success;
        data.canccel_next = data.cancel_next || "/";
        data.modal_class = data.modal_class || "signin";
        uR.AUTH_SUCCESS = success;
        uR.route("/auth/login/?next="+escape(path));
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
    var slug = data.matches[1];
    data.url = uR.urls.api[slug];
    data.schema = uR.schema.auth[slug];
    data.title = {
      login: "Please Login to Continue",
      register: "Create an Account",
      'forgot-password': "Request Password Reset"
    }[slug]
    uR.alertElement("auth-modal",data);
  }

  uR.ready(function() {
    uR.auth.user = uR.storage.get("auth.user");
    riot.mount(uR.auth.tag_names);
    uR.ajax({
      url: "/user.json",
      success: function(data) {
        if (data.user != uR.auth.user) { uR.auth.setUser(data.user) }
      },
    });
  });
})()
