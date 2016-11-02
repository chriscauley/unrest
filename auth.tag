<auth-modal>
  <div ur-mask onclick={ close }></div>
  <dialog class={ uR.theme.modal_outer } open>
    <div class={ uR.theme.modal_header }>
      <h3>{ title }</h3>
    </div>
    <div class={ uR.theme.modal_content }>
      <ur-form schema={ opts.schema } action={ uR.urls.auth.login } method="POST"
               ajax_success={ opts.success }></ur-form>
      <center if={ opts.matches[1] == 'login' }>
        <a href="/auth/register/">Create an Account</a><br/>
        <a href="/auth/forgot-password/">Forgot Password?</a>
      </center>
      <center if={ opts.matches[1] == 'register' }>
        Already have an account? <a href="/auth/login/">Login</a> to coninue
      </center>
      <center if={ opts.matches[1] == 'password_reset' }>
        Did you suddenly remember it? <a href="/auth/login/">Login</a>
      </center>
    </div>
  </dialog>
  ajax_success(data) {
    uR.auth.setUser(data.user);
    (uR.AUTH_SUCCESS || function() { riot.route(uR.getQueryParameter("next") || "/"); })();
  }
  close(e) {
    this.unmount();
    riot.update("*");
  }
</auth-modal>

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
