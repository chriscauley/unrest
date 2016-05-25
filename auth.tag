<auth-login>
  <modal title="Please login to continue.">
    <ur-form schema="{ uR.schema.login }" action={ uR.urls.auth.login } method="POST"></ur-form>
  </modal>
</auth-login>

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
