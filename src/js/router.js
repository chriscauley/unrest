(function() {
  uR.mountElement = function mountElement(names,options) {
    options = options || {};
    if (options.ur_modal) {
      options.mount_to = options.mount_to || uR.config.mount_alerts_to;
    }
    const mount_to = options.mount_to || uR.config.mount_to;
    const target = document.querySelector(mount_to);
    const children = target.childNodes;
    let i = target.childNodes.length;
    while (i--) { target.removeChild(children[i]); }

    if (typeof names == "string") { names = [names]; }
    const _t = [];
    names.forEach((name) => {
      name = name.replace(/\//g,''); // Some tags pass in tag name for path like /hello-world/
      const element = document.createElement(name);
      if (options.innerHTML) { element.innerHTML = options.innerHTML; }
      target.appendChild(element);
      _t.push(mount_to + " " + name);
    });
    riot.mount(_t.join(","),options);
    if (names.join(",").toUpperCase().indexOf(uR.router._current_tagname) == -1) {
      uR.router._current_tag = uR.router._current_tagname = undefined;
    }
  };

  uR.alertElement = function alertElement(name,options={}) {
    uR.defaults(options,{ ur_modal: true })
    uR.mountElement(name,options);
  };

  uR.newElement = function newElement(tagName,attrs,options) {
    const element = document.createElement(tagName);
    if (attrs.parent) {
      attrs.parent.appendChild(element);
      delete attrs.parent;
    }

    element.innerHTML = attrs.innerHTML || "";
    delete attrs.innerHTML;

    for (let attr in attrs) { element[attr] = attrs[attr]; }
    if (options) { riot.mount(element,options); }
    return element;
  };

  uR.loadTemplate = (template_name,data) => {
    template_name = template_name.match(/[^/].+[^/]/)[0].replace(/\//g,"-");
    riot.compile(
      uR.static("templates/"+template_name+".html"),
      () => { uR.router.routeElement(template_name)(template_name,data); }
    );
  };

  function pushState(path,_data) {
    if (window.location.pathname == path) { return; }
    // #! TODO the empty string here is the page title. Need some sort of lookup table
    history.replaceState({path:path},"" || document.title,path);
  } 

  uR.pushState = uR.debounce(pushState,100);

  uR.route = (href,data={}) => {
    const new_url = new URL(href,href.match("://")?undefined:window.location.origin);
    const old_url = new URL(window.location.href);
    const pathname = (new_url.pathname || href).replace(window.location.origin,"");

    uR._on_routes.forEach(f => f(pathname,data));
    const path_match = uR.router.resolve(pathname);
    const hash_match = new_url && uR.router.resolve(new_url.hash);

    if (hash_match) {
      _.extend(data,{
        matches: hash_match,
        ur_modal: new_url.hash.match(uR.config.MODAL_PREFIX),
        cancel: function() {
          window.location.hash = "";
          this.unmount && this.unmount();
        }
      });
      uR._routes[hash_match.key](new_url.hash,data);
    } else if (path_match) {
      _.extend(data,{ matches: path_match });
      document.body.dataset.ur_path = pathname;
      uR._routes[path_match.key](pathname,data);
      if (uR.STALE_STATE) { window.location.hash = ""; }
    }
    if (path_match || hash_match) {
      uR.pushState(href);
      uR.STALE_STATE = true;
      return;
    } else if (uR.router.default_route) {
      _.extend(data,{matches: []});
      uR.router.default_route(pathname,data);
      return;
    }
    // uR.config.do404();

    // #! TODO The following is used for django pages + back button
    // We're not in the single page app, reload if necessary
    if (uR.STALE_STATE || new_url.href != old_url.href) {
      window.location = new_url.href;
    }
    uR.STALE_STATE = true;
    data.one && data.one.route && data.one.route();
    data.on && data.on.route && data.on.route();
  };

  function onClick(e) {
    // Borrowed heavily from riot
    // this will stop links from changing the page so I can use href instead of onclick
    if (
      e.which != 1 // not left click
        || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
        || e.defaultPrevented // or default prevented
    ) return;

    let el = e.target, loc = (window.history.location || window.location);
    if (el && el.nodeName) {
      let selector = el.nodeName;
      if (el.id) { "#"+el.id; }
      if (el.className) { selector += "." + el.className; }
      if (el.name) { selector += "[name="+el.name+"]"; }
      window.airbrake && window.airbrake.log("clicked: " + selector);
    }
    while (el && el.nodeName != 'A') el = el.parentNode;

    if (
      !el || el.nodeName != 'A' // not A tag
        || el.hasAttribute('download') // has download attr
        || !el.hasAttribute('href') // has no href attr
        || el.target && el.target != '_self' // another window or frame
        || el.href.indexOf(loc.href.match(/^.+?\/\/+[^/]+/)[0]) == -1 // cross origin
    ) return;

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

  const RouterMixin = {
    init: function() {
      if (this.opts.opts) { // should probably be in a more generic mixin
        _.extend(this.opts,this.opts.opts);
        delete this.opts.opts;
      }
      uR.router._onOne(this,this.opts); // should probably be in a more generic mixin
      if (uR.router._current_tagname == this.__.tagName.toUpperCase()) {
        // this tag can be updated, so store it in uR.router
        uR.router._current_tag = this;
        this.on("unmount",function () {
          // all done, remove this if still assigned to the router
          if (uR.router._current_tagname == this.root.tagName) { uR.router._current_tagname = undefined; }
          if (uR.router._current_tag == this) { uR.router._current_tag = undefined; }
        });
      }

      // update after routing. this.one is used to make the update happen after all other route listener functions
      this.on("route",() => this.isMounted && this.one("route",() => this.update()));
      this.on("mount",() => this.trigger("route"));
    }
  };
  window.riot && window.riot.mixin(RouterMixin);

  uR.config.do404 = function() { uR.mountElement("four-oh-four"); };
  uR.config.MODAL_PREFIX = /^#!/;
  uR._routes = uR._routes || {};
  uR._on_routes = [];
  uR.onRoute = function(f) { uR._on_routes.push(f); };
  uR.router = {
    _onOne(tag,opts) {
      // useful for passing in lifecycle events as options for riot tags
      for (let key in opts.on || {}) { tag.on(key,opts.on[key]); }
      for (let key in opts.one || {}) { tag.on(key,opts.one[key]); }
    },
    start: function() {
      document.addEventListener('click', onClick);
      window.addEventListener('hashchange', () => uR.route(new URL(e.newURL).hash));
      uR.router.ready.start();
      // window.popstate = function(event) { uR.route(window.location.href,event.state,false); };
    },
    ready: new uR.Ready(),
    add: function(routes) { uR.extend(uR._routes,routes); },
    routeElement: function(element_name) {
      return function(pathname,data) {
        var tagName = element_name.toUpperCase();
        var _current = uR.router._current_tag;
        if (_current && _current.root.tagName == tagName) {
          // reuse _current_tag since it matches the desired route
          uR.router._onOne(_current,data);
          _current.trigger("route",data);
        } else {
          uR.router._current_tagname = tagName;
          uR.mountElement(element_name,data);
        }
      };
    },
    resolve: function(path) {
      for (var key in uR._routes) {
        var regexp = new RegExp(key);
        var match = path.match(regexp);
        if (match) {
          match.key = key;
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
