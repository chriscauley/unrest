<auth-modal>
  <div ur-mask onclick={ close }></div>
  <dialog class={ uR.theme.modal_outer } open>
    <div class={ uR.theme.modal_header }>
      <h3>{ title }</h3>
    </div>
    <div class={ uR.theme.modal_content }>
      <ur-form schema={ schema } action={ url } method="POST" ajax_success={ opts.success }></ur-form>
      <center if={ slug == 'login' }>
        <a href="/auth/register/?next={ next }">Create an Account</a><br/>
        <a href="/auth/forgot-password/?next={ next }">Forgot Password?</a>
      </center>
      <center if={ slug == 'register' }>
        Already have an account? <a href="/auth/login/?next={ next }">Login</a> to coninue
      </center>
      <center if={ slug == 'password_reset' }>
        Did you suddenly remember it? <a href="/auth/login/?next={ next }">Login</a>
      </center>
    </div>
  </dialog>
  var self = this;
  ajax_success(data) {
    uR.auth.setUser(data.user);
    (uR.AUTH_SUCCESS || function() {
      var path = self.next || "/";
      if (window.location.pathname.startsWith("/auth/")) { path == "/"; } // avoid circular redirect!
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
  close(e) {
    if (window.location.pathname.startsWith("/auth/")) { window.location = "/" }
    this.unmount();
  }
</auth-modal>

<auth-dropdown>
  <li if={ !uR.auth.user }>
    <a href="/auth/register/?next={ window.location.pathname }">Login or Register</a>
  </li>
  <li if={ uR.auth.user }>
    <a onclick={ toggle }>{ uR.auth.user.username }</a>
    <ul class="dropdown-content">
      <li each={ links }><a href={ url }><i class="fa fa-{ icon }"></i> { text }</a></li>
    </ul>
  </li>

  this.on("mount",function() {
    if (uR.auth.user) { this.links = uR.auth.getLinks() }
  });
</auth-dropdown>
