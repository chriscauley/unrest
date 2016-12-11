(function() {
  uR.mountElement = function mountElement(name,options) {
    options = options || {};
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
    options.mount_to = uR.config.mount_alerts_to;
    uR.mountElement(name,options);
  }

  function pushState(path) {
    if (window.location.pathname == path) { return; }
    // #! TODO the empty string here is the page title. Need some sort of lookup table
    history.pushState({path:path},"" || document.title,path);
  } 

  uR.pushState = uR.debounce(pushState,100)

  uR.route = function route(href,data) {
    // we don't want the domain, just the pathname,search,and hash
    var matches = href.match(/\/\/[^\/]+(\/.*)/);
    var path = matches?matches[1]:href;

    uR.forEach(uR._on_routes,function(f) {f(path,data)})
    data = data || {};
    for (key in uR._routes) {
      data.matches = path.match(new RegExp(key));

      if (data.matches) {
        uR.STALE_STATE = true;
        uR._routes[key](path,data);
        uR.pushState(path);
        return;
      }
    }

    // uR.config.do404();

    // #! TODO The following is used for django pages + back button
    // We're not in the single page app, reload if necessary
    var current_path = window.location.href.match(/\/\/[^\/]+(\/.*)/)[1].split("?")[0]
    if (uR.STALE_STATE && current_path != path.split("?")[0]) {
      window.location = path;
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
        || base[0] != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
        || base[0] == '#' && el.href.split(base)[0] != loc.href.split(base)[0] // outside of #base
        || !go(getPathFromBase(el.href), el.title || document.title) // route not found
    )) return*/

    e.preventDefault();
    uR.route(el.href);
  }

  uR.addRoutes = function(routes) { uR.extend(uR._routes,routes); }
  uR.startRouter = function() { document.addEventListener('click', onClick); };

  uR.confirm = function(text,options) {
    options = options || {};
    options.cancel_text = options.cancel_text || "Cancel";
    options.cancel = options.cancel || function() {};
    options.success_text = options.success_text || "Continue";
    options.success = options.success || function() {};
    options.innerHTML = "<center style='margin-bottom: 1em;'>"+text+"</center>";
    options.mount_to = options.mount_alerts_to || uR.config.mount_alerts_to;
    uR.mountElement("modal",options);
  }
  uR.config.do404 = function() { uR.mountElement("four-oh-four"); }
  uR._routes = uR._routes || {};
  uR._on_routes = [];
  uR.onRoute = function(f) { uR._on_routes.push(f) }
})();
