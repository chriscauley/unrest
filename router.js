(function() {
  function pushState(path) {
    if (window.location.pathname == path) { return; }
    history.pushState({path:path},titles[path] || document.title,path);
  } 
  uR.pushState = uR.debounce(pushState,100)
  window.onpopstate = function(e) { uR.route(window.location.pathname); }
  uR.route = function route(path,data) {
    data = data || {};
    for (key in uR._routes) {
      data.matches = path.match(new RegExp(key));
      if (data.matches) {
        uR.STALE_STATE = true;
        uR.pushState(path);
        uR._routes[key](path,data);
        return;
      }
    }
    // We're not in the single page app, reload if necessary
    if (uR.STALE_STATE) { window.location = path; }
  }
  uR._routes = uR._routes || {};
})()
