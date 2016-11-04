<auth-modal>
  <div ur-mask onclick={ close }></div>
  <dialog class={ uR.theme.modal_outer } open>
    <div class={ uR.theme.modal_header }>
      <h3>{ opts.title }</h3>
    </div>
    <div class={ uR.theme.modal_content }>
      <ur-form schema={ opts.schema } action={ opts.url } method="POST"
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
    (uR.AUTH_SUCCESS || function() {
      var path = uR.getQueryParameter("next") || "/";
      if (window.location.pathname.startsWith("/auth/")) { path == "/"; } // avoid circular redirect!
      uR.route(path);
    })();
  }
  this.on("mount",function() {
    if (uR.auth.user) {
      this.ajax_success({ user: uR.auth.user });
    }
  });
  close(e) {
    this.unmount();
    riot.update("*");
  }
</auth-modal>

<auth-dropdown>
  <li if={ !uR.auth.user }>
    <a href="/auth/register/?next={ window.location.pathname }">Login or Register</a>
  </li>
  <li if={ uR.auth.user }>
    <a onclick={ toggle }>{ uR.auth.user.username }</a>
    <ul class="dropdown-content">
      <li><a href="/account/settings/"><i class="fa fa-gear"></i> Account Settings</a></li>
      <li><a href="/accounts/logout/" onclick={ logout }><i class="fa fa-sign-out"></i> Log Out</a></li>
    </ul>
  </li>

  logout(e) {
    uR.auth.setUser(null);
    console.log(window.localStorage.getItem("auth.user"));
    uR.route(e.target.href);
  }
</auth-dropdown>
