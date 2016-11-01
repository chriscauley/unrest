<auth-login>
  <div ur-mask onclick={ close }></div>
  <dialog class={ uR.theme.modal_outer } open>
    <div class={ uR.theme.modal_header }>
      <h3>Please Login to Continue</h3>
    </div>
    <div class={ uR.theme.modal_content }>
      <ur-form schema={ schema } action={ uR.urls.auth.login } method="POST"
               ajax_success={ opts.success }></ur-form>
      <center>
        <a href="/auth/register/">Create an Account</a><br/>
        <a href="/auth/forgot-password/">Forgot Password?</a>
      </center>
    </div>
  </dialog>

  this.schema = uR.schema.login || [
    { name: 'username', label: 'Username or Email' },
    { name: 'password', type: 'password' },
  ];
  close(e) {
    this.unmount();
    riot.update("*");
  }
</auth-login>

<auth-register>
  <div ur-mask onclick={ close }></div>
  <dialog class={ uR.theme.modal_outer } open>
    <div class={ uR.theme.modal_header }>
      <h3>Create an Account</h3>
    </div>
    <div class={ uR.theme.modal_content }>
      <ur-form schema={ schema } action={ uR.urls.auth.login } method="POST"
               ajax_success={ opts.success }></ur-form>
    </div>
    <center>
      Already have an account? <a href="/auth/login/">Login</a> to coninue
    </center>
  </dialog>

  this.schema = uR.schema.register || [
    { name: 'username', label: 'Username or Email' },
    { name: 'password', type: 'password' },
  ];
  close(e) {
    this.unmount();
    riot.update("*");
  }
</auth-register>

<auth-menu>
  <!-- currently unused -->
  <h1>Login to Continue</h1>
  <div class="">
    <a each={ auth_sercives } href={ href } class={ slug }>{ title }</a>
    <a href={ uR.urls.auth.login } class="email">Email</a>
  </div>
  var self = this;
  this.on("mount",function() {
    this.auth_services = [];
    uR.forEach(uR.config.auth_services,function(s) {
      if (!s.slug) { s = { slug: s }; }
      s.title = s.title || s.slug.charAt(0).toUpperCase() + s.slug.slice(1);
      s.href = new RegExp(uR.urls.auth.social).compile(s.slug);
      self.auth_services.push(s);
    });
  });
</auth-menu>
