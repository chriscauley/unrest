uR.ready(function() {
  riot.mount("ur-nav");
});

<ur-nav>
  <nav>
    <div class="nav-wrapper">
      <a href="/about/" class="brand-logo" style="height: 100%;">
        <img src="{ uR.config.logo || 'logo.png' }" style="height: 100%">
      </a>
      <ul id="nav-mobile" class="right hide-on-med-and-down">
        <yield></yield>
        <auth-dropdown></auth-dropdown>
      </ul>
    </div>
  </nav>

</ur-nav>
