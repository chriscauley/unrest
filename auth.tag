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
      uR.auth.ready(function() {
        function success(data) {
          if (data) { uR.auth.setUser(data.user); }
          func.apply(this,args);
        }
        if (!uR.auth.user || data.force) {
          uR.AUTH_SUCCESS = success;
          data.next = window.location.href;
          uR.route(uR.urls.auth.login,data);
        }
        else { success(); }
      });
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
      <!--{url: "/account/settings/", icon: "gear", text: "Account Settings"},-->
      {url: "/accounts/logout/", icon: "sign-out", text: "Log Out"},
    ];
  }
  uR.auth.getLinks = uR.auth._getLinks;
  uR.auth.auth_regexp = /^\/auth\//;

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
    login: "#/auth/login/",
    register: "#/auth/register/",
    password_reset: "#/auth/forgot-password/",
  }
  uR.urls.api = uR.urls.api || {};
  uR.urls.api.login = "/api/login/";
  uR.urls.api.register = "/api/register/";
  uR.urls.api['password-reset'] = "/api/password-reset/";
  uR.auth.tag_names = 'auth-dropdown,auth-modal';
  uR.addRoutes({
    "#?/auth/(login|register|forgot-password)/": function(path,data) { uR.alertElement("auth-modal",data); },
    "#?/auth/logout/": function(path,data) {
      uR.auth.setUser(null);
      uR.route("/accounts/logout/");
    },
  });

  uR.auth.user = uR.storage.get("auth.user");
  uR.ready(function() {
    riot.mount(uR.auth.tag_names);
    uR.auth.reset();
  });
  var _ready = [];
  uR.auth.ready = function(f) { _ready.push(f) };
  uR.auth.reset = function(callback) {
    callback = callback || function() {}
    uR.ajax({
      url: "/user.json",
      success: function(data) {
        if (data.user != uR.auth.user) { uR.auth.setUser(data.user); }
        callback();
        uR.auth.ready = function(f) { f(); }
        uR.forEach(_ready,uR.auth.ready);
      },
    });
  }
})();

<auth-modal>
  <div class={ theme.outer }>
    <div class={ theme.header }>
      <h3>{ title }</h3>
    </div>
    <div class={ theme.content }>
      <div class="social" if={ slug != 'fogot_password' && uR.auth.social_logins.length }>
        <a class="btn btn-block btn-{ icon }" href="/login/{ slug }?next={ next }" each={ uR.auth.social_logins }>
          <i class="fa fa-{ icon }"></i> Connect with { name }</a>
        <center>- or { slug } using your email address -</center>
      </div>
      <ur-form schema={ schema } action={ url } method="POST" ajax_success={ opts.success }></ur-form>
      <center if={ slug == 'login' }>
        <a href="{ uR.urls.auth.register }?next={ next }">Create an Account</a><br/>
        <a href="{ uR.urls.auth.password_reset }?next={ next }">Forgot Password?</a>
      </center>
      <center if={ slug == 'register' }>
        Already have an account? <a href="{ uR.urls.auth.login }?next={ next }">Login</a> to coninue
      </center>
      <center if={ slug == 'password_reset' }>
        Did you suddenly remember it? <a href="{ uR.urls.auth.login }?next={ next }">Login</a>
      </center>
    </div>
  </div>
  var self = this;
  ajax_success(data) {
    uR.auth.setUser(data.user);
    (uR.AUTH_SUCCESS || function() {
      var path = self.next || window.location.pathname;
      if (path.match(uR.auth.auth_regexp)) { path == "/"; } // avoid circular redirect!
      uR.route(path);
    })();
    self.unmount();
    uR.AUTH_SUCCESS = undefined;
  }
  this.on("mount",function() {
    if (uR.auth.user) { this.ajax_success({ user: uR.auth.user }); }
    this.next = uR.getQueryParameter("next");
    this.slug = this.opts.slug || this.opts.matches[1];
    this.url = uR.urls.api[this.slug];
    this.schema = uR.schema.auth[this.slug];
    this.title = {
      login: "Please Login to Continue",
      register: "Create an Account",
      'forgot-password': "Request Password Reset"
    }[this.slug];
    this.update();
  });
  this.on("update", function() {
    // user logged in sometime after this was mounted!
    if (uR.auth.user) { self.ajax_success({user: uR.auth.user}) }
  });
  cancel(e) {
    if (window.location.pathname.match(uR.auth.auth_regexp)) { uR.route("/") }
    window.location.hash = "";
    this.unmount()
  }
</auth-modal>

<auth-dropdown>
  <li if={ !uR.auth.user }>
    <a href="{ url }?next={ window.location.pathname }"><i class="{ icon }"></i> { text }</a>
  </li>
  <li if={ uR.auth.user }>
    <a onclick={ toggle }>{ uR.auth.user.username }</a>
    <ul class="dropdown-content">
      <li each={ links }><a href={ url }><i class="fa fa-{ icon }"></i> { text }</a></li>
    </ul>
  </li>

  this.on("update",function() {
    if (uR.auth.user) { this.links = uR.auth.getLinks(); }
    else {
      this.url = uR.auth.login_url || uR.urls.auth.login;
      this.icon = uR.auth.login_icon || "fa fa-user";
      this.text = uR.auth.login_text || "Login or Register";
    }
  });
</auth-dropdown>
