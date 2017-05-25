uR.ready(function() {
  riot.mount("ur-nav");
});

<ur-nav>
  <nav>
    <div class="nav-wrapper">
      <a href="/about/" class="brand-logo" style="height: 100%;">
        <img src="/media/uploads/photos/2017-05/YPlogo_F4R1UOw.png" style="height: 100%">
      </a>
      <ul id="nav-mobile" class="right hide-on-med-and-down">
        <li><a href="/about/">About</a></li>
        <li><a href="/event/schedule/">Schedule</a></li>
        <li><a href="/admin/">Admin</a></li>
        <auth-dropdown></auth-dropdown>
      </ul>
    </div>
  </nav>
</ur-nav>
