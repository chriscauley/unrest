(function() {
  uR.mountElement = function mountElement(name,options) {
    var options = options || {};
    var target = document.querySelector(options.mount_to || uR.config.mount_to);
    var children = target.childNodes;
    for (var i=0;i<target.childNodes.length;i++) { target.removeChild(children[i]); }
    target.appendChild(document.createElement(name));
    riot.mount(name,options);
  }
  function pushState(path) {
    if (window.location.pathname == path) { return; }
    // #! TODO the empty string here is the page title. Need some sort of lookup table
    history.pushState({path:path},"" || document.title,path);
  } 
  uR.pushState = uR.debounce(pushState,100)
  window.onpopstate = function(e) { uR.route(window.location.pathname); }
  uR.route = function route(path,data) {
    uR.forEach(uR._on_routes,function(f) {f(path,data)})
    data = data || {};
    uR.pushState(path);
    for (key in uR._routes) {
      data.matches = path.match(new RegExp(key));
      if (data.matches) {
        uR.STALE_STATE = true;
        uR._routes[key](path,data);
        return;
      }
    }
    uR.mountElement("four-oh-four");

    // #! TODO The following is used for django pages + back button
    // We're not in the single page app, reload if necessary
    // if (uR.STALE_STATE) { window.location = path; }
  }
  uR._routes = uR._routes || {};
  uR._on_routes = [];
  uR.onRoute = function(f) { uR._on_routes.push(f) }
  uR.ready(function() { uR.route(window.location.pathname) });
})()
