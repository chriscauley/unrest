(function() {
  uR.mountElement = function mountElement(name,options) {
    var options = options || {};
    var target = document.querySelector(options.mount_to || uR.config.mount_to);
    var children = target.childNodes;
    var i = target.childNodes.length;
    while (i--) { target.removeChild(children[i]); }
    var element = document.createElement(name);
    if (options.innerHTML) { element.innerHTML = options.innerHTML; }
    target.appendChild(element);
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

    uR.config.do404();

    // #! TODO The following is used for django pages + back button
    // We're not in the single page app, reload if necessary
    // if (uR.STALE_STATE) { window.location = path; }
  }
  uR.alert = function(text) {
    uR.mountElement("modal",{
      cancel_text: "Close",
      innerHTML: "<center style='margin-bottom: 1em;'>"+text+"</center>",
    });
  }

  uR.confirm = function(text,options) {
    options = options || {};
    options.cancel_text = options.cancel_text || "Cancel";
    options.cancel = options.cancel || function() {};
    options.success_text = options.success_text || "Continue";
    options.success = options.success || function() {};
    options.innerHTML = "<center style='margin-bottom: 1em;'>"+text+"</center>";
    uR.mountElement("modal",options);
  }
  uR.config.do404 = function() { uR.mountElement("four-oh-four"); }
  uR._routes = uR._routes || {};
  uR._on_routes = [];
  uR.onRoute = function(f) { uR._on_routes.push(f) }
  uR.ready(function() { uR.route(window.location.pathname) });
})()
