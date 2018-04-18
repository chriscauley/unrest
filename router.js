(function() {
  uR.mountElement = function mountElement(names,options) {
    options = options || {};
    if (options.ur_modal) {
      options.mount_to = options.mount_to || uR.config.mount_alerts_to;
    }
    var mount_to = options.mount_to || uR.config.mount_to
    var target = document.querySelector(mount_to);
    var children = target.childNodes;
    var i = target.childNodes.length;
    while (i--) { target.removeChild(children[i]); }

    if (typeof names == "string") { names = [names]; }
    var _t = [];
    uR.forEach(names,function(name) {
      name = name.replace(/\//g,''); // Some tags pass in tag name for path like /hello-world/
      var element = document.createElement(name);
      if (options.innerHTML) { element.innerHTML = options.innerHTML; }
      target.appendChild(element);
      _t.push(mount_to + " " + name);
    });
    riot.mount(_t.join(","),options);
  }

  uR.alertElement = function alertElement(name,options) {
    options = options || {};
    if (!options.hasOwnProperty("ur_modal")) { options.ur_modal = true; }
    uR.mountElement(name,options);
  }

  uR.newElement = function newElement(tagName,attrs,options) {
    var element = document.createElement(tagName);
    if (attrs.parent) {
      attrs.parent.appendChild(element);
      delete attrs.parent;
    }

    element.innerHTML = attrs.innerHTML || "";
    delete attrs.innerHTML;

    for (var attr in attrs) { element[attr] = attrs[attr]; }
    if (options) { riot.mount(element,options); }
    return element;
  }

  uR.loadTemplate = function loadTemplate(template_name,data) {
    template_name = template_name.match(/[^\/].+[^\/]/)[0].replace(/\//g,"-");
    riot.compile(
      uR.static("templates/"+template_name+".html"),
      function(html) { uR.mountElement(template_name,data); }
    );
  }

  function pushState(path,data) {
    if (window.location.pathname == path) { return; }
    // #! TODO the empty string here is the page title. Need some sort of lookup table
    history.replaceState({path:path},"" || document.title,path);
  } 

  uR.pushState = uR.debounce(pushState,100);

  uR.route = function route(href,data) {
    var new_url = new URL(href,href.match("://")?undefined:window.location.origin);
    var old_url = new URL(window.location.href);
    var pathname = (new_url.pathname || href).replace(window.location.origin,"");

    uR.forEach(uR._on_routes,function(f) {f(pathname,data)});
    var path_match = uR.router.resolve(pathname);
    var hash_match = new_url && uR.router.resolve(new_url.hash);
    if (path_match) {
      var data = { matches: path_match };
      document.body.dataset.ur_path = pathname;
      uR._routes[path_match.key](pathname,data);
    } else if (hash_match) {
      var data = {
        matches: hash_match,
        ur_modal: new_url.hash.match(uR.config.MODAL_PREFIX),
        cancel: function() {
          window.location.hash = "";
          this.unmount && this.unmount();
        }
      }
      uR._routes[hash_match.key](new_url.hash,data);
    }
    if (path_match || hash_match) {
      uR.pushState(href);
      uR.STALE_STATE = true;
      return;
    } else if (uR.router.default_route) { uR.router.default_route(pathname,{matches: []}); }
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
    if (el && el.nodeName) {
      var selector = el.nodeName;
      if (el.id) { "#"+el.id; }
      if (el.className) { selector += "." + el.className; }
      if (el.name) { selector += "[name="+el.name+"]" }
      window.airbrake && window.airbrake.log("clicked: " + selector);
    }
    while (el && el.nodeName != 'A') el = el.parentNode;

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

  var RouterMixin = {
    init: function() {
      if (uR.router._current_tagname == this.__.tagName.toUpperCase()) {
        // this tag can be updated, so store it in uR.router
        uR.router._current_tag = this;
        this.on("unmount",function () {
          // all done, remove this if still assigned to the router
          if (uR.router._current_tagname == this.root.tagName) { uR.router._current_tagname = undefined }
          if (uR.router._current_tag == this) { uR.router._current_tag = undefined }
        });
      }
    }
  }
  window.riot && window.riot.mixin(RouterMixin);

  uR.config.do404 = function() { uR.mountElement("four-oh-four"); }
  uR.config.MODAL_PREFIX = /^#!/;
  uR._routes = uR._routes || {};
  uR._on_routes = [];
  uR.onRoute = function(f) { uR._on_routes.push(f) }
  uR.router = {
    start: function() {
      document.addEventListener('click', onClick);
      // window.popstate = function(event) { uR.route(window.location.href,event.state,false); };
    },
    add: function(routes) { uR.extend(uR._routes,routes); },
    routeElement: function(element_name) {
      return function(pathname,data) {
        var tagName = element_name.toUpperCase();
        if (uR.router._current_tag &&
            uR.router._current_tag.root.tagName == tagName &&
            typeof uR.router._current_tag.route == "function") {
          uR.router._current_tag.route(pathname,data);
        } else {
          uR.router._current_tagname = tagName;
          uR.mountElement(element_name,data);
        }
      }
    },
    resolve: function(path) {
      for (var key in uR._routes) {
        var regexp = new RegExp(key);
        var match = path.match(regexp)
        if (match) {
          match.key = key
          return match;
        }
      }
    },
  };
  uR.startRouter = uR.depracated(uR.router.start,'uR.startRouter','uR.router.start()');
  uR.addRoutes = uR.depracated(uR.router.add,'uR.addRoutes','uR.router.add()');
  if (!document.querySelector("#alert-div")) { // #! TODO this is hardcoded, but am unsure what else to do CCC
    var e = document.createElement("div");
    e.id = "alert-div";
    document.body.appendChild(e);
  }
})();
