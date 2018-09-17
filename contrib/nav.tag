uR.ready(function() {
  riot.mount("ur-nav");
  uR.nav = {
    links: [],
    add: (link) => {
      uR.nav.links.push(link)
    },
  }
});

<ur-nav class={ theme.outer }>
  <nav>
    <div class="nav-wrapper">
      <yield from="logo">
        <a href="/about/" class="brand-logo" style="height: 100%;">
          <img src="{ uR.config.logo || 'logo.png' }" style="height: 100%">
        </a>
      </yield>
      <ul id="nav-mobile" class={ theme.list }>
        <yield from="links">
          <li each={ link, il in uR.nav.links } class={ link.className }>
            <a href={ link.href }>{ link.text }</a>
          </li>
        </yield>
      </ul>
    </div>
  </nav>

this.theme = uR.css.nav;
this.on("update", () => {
  uR.nav.links.forEach(link => {
    link.className = this.theme.link;
    // #! TODOif (link.href == window.location.href) { className = this.theme.link_active }
  })
})
this.on("mount",() => this.update())
</ur-nav>
