(function() {
  uR.mountElement = function mountElement(name,options) {
    name = name.replace(/\//g,''); // Some tags pass in tag name for path like /hello-world/
    options = options || {};
    if (options.ur_modal) {
      options.mount_to = options.mount_to || uR.config.mount_alerts_to;
    }
    var target = document.querySelector(options.mount_to || uR.config.mount_to);
    var children = target.childNodes;
    var i = target.childNodes.length;
    while (i--) { target.removeChild(children[i]); }
    var element = document.createElement(name);
    if (options.innerHTML) { element.innerHTML = options.innerHTML; }
    target.appendChild(element);
    riot.mount(name,options);
  }

  uR.alertElement = function alertElement(name,options) {
    options = options || {};
    if (!options.hasOwnProperty("ur_modal")) { options.ur_modal = true; }
    uR.mountElement(name,options);
  }

  function pushState(path) {
    if (window.location.pathname == path) { return; }
    // #! TODO the empty string here is the page title. Need some sort of lookup table
    history.pushState({path:path},"" || document.title,path);
  } 

  uR.pushState = uR.debounce(pushState,100);

  uR.route = function route(href,data) {
    var new_url = new URL(href,href.match("://")?undefined:window.location.origin);
    var old_url = new URL(window.location.href);
    var pathname = new_url.pathname || href;

    uR.forEach(uR._on_routes,function(f) {f(pathname,data)});
    data = data || {};
    data.location = new_url;
    for (var key in uR._routes) {
      var regexp = new RegExp(key);
      var path_match = pathname.match(regexp);


      if (path_match) {
        uR.STALE_STATE = true;
        data.matches = path_match;
        uR._routes[key](pathname,data);
        uR.pushState(href);
      } else if (new_url.hash && key.startsWith("#?")) {
        data.matches = new_url.hash.match(regexp);
        if (data.matches) {
          data.ur_modal = true;
          data.cancel = function() {
            window.location.hash = "";
            this.unmount();
          }
          uR.STALE_STATE = true;
          uR._routes[key](pathname,data);
          uR.pushState(href);
        }
      }
    }
    if (data.matches) { return }
    // uR.config.do404();

    // #! TODO The following is used for django pages + back button
    // We're not in the single page app, reload if necessary
    if (uR.STALE_STATE) {
      window.location = href;
    }
    uR.STALE_STATE = true;
  }

  function onClick(e) {
    // Borrowed heavily from riot
    // this will stop links from changing the page so I can use href instead of onclick
    if (
      e.which != 1 // not left click
        || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
        || e.defaultPrevented // or default prevented
    ) return

    var el = e.target, loc = (window.history.location || window.location);
    while (el && el.nodeName != 'A') el = el.parentNode

    if (
      !el || el.nodeName != 'A' // not A tag
        || el.hasAttribute('download') // has download attr
        || !el.hasAttribute('href') // has no href attr
        || el.target && el.target != '_self' // another window or frame
        || el.href.indexOf(loc.href.match(/^.+?\/\/+[^\/]+/)[0]) == -1 // cross origin
    ) return

    /*if (el.href != loc.href && (
      el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
        || el.href.startsWith("#") // hash only
        || base[0] != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
        || base[0] == '#' && el.href.split(base)[0] != loc.href.split(base)[0] // outside of #base
        || !go(getPathFromBase(el.href), el.title || document.title) // route not found
    )) return*/

    e.preventDefault();
    uR.route(el.href);
  }

  uR.addRoutes = function(routes) { uR.extend(uR._routes,routes); }
  uR.startRouter = function() {
    document.addEventListener('click', onClick);
  };

  uR.config.do404 = function() { uR.mountElement("four-oh-four"); }
  uR._routes = uR._routes || {};
  uR._on_routes = [];
  uR.onRoute = function(f) { uR._on_routes.push(f) }
})();
