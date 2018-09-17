(function() {
  window.uR = window.uR || {};
  uR.TrueDate = window.Date; // because under-construction uses timeShift.js to override date
  uR.timeIt = function(f,this_argument) {
    this_argument && f.bind(this_argument);
    return function() {
      var start = new Date();
      f.apply(this,arguments);
      console.log(f.name,"took",(new Date() - start)/1000);
    };
  };

  uR.t = function t() {
    var now = new uR.TrueDate().valueOf();
    console.log('uR.t +',(now-uR.t._last)+" ms",...arguments);
    uR.t._last = now;
  };
  uR.t._last = new Date().valueOf();


  uR.Ready = function Ready(isReady=()=>false,_ready=[]) {
    function log() {
      //console.log.apply(this,arguments);
    }
    function error() {
      //console.error.apply(this,arguments);
    }
    var ready = function ready() {
      uR.forEach(arguments || [],function(f) {
        window.airbrake && f.name && window.airbrake.log("ready: " + f.name);
        if (typeof f == "function") { _ready.push(f); log('in queue',f.name); }
        else { log(f); }
      });
      var in_queue = _ready.length;
      while (isReady() && _ready.length) {
        log("doing it!");
        _ready.shift()();
      }
      error("Ready",in_queue,_ready.length);
    };
    ready._name = isReady.name;
    ready.start = function() {
      window.airbrake && window.airbrake.log("unrest starting");
      isReady = function() { return true; };
      ready();
    };
    ready.stop = function() {
      window.airbrake && window.airbrake.log("unrest stopping");
      isReady = function() { return false; };
    };
    return ready;
  };

  uR.escapeHTML = function escapeHTML(s) { // taken from under-construction/lib/diff.js
    return s && s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  uR.serializeForm = function serializeForm(form) {
    var field, s = [];
    if (typeof form != 'object' && form.nodeName != "FORM") { return; }
    var len = form.elements.length;
    for (var i=0; i<len; i++) {
      field = form.elements[i];
      const name = field.name || "FIELD__"+i;
      const type = field.type;
      if (field.disabled || type == 'file' || type == 'reset' || type == 'submit' || type == 'button') { continue; }
      if (type == 'select-multiple') {
        for (j=form.elements[i].options.length-1; j>=0; j--) {
          if(field.options[j].selected)
            s.push(encodeURIComponent(name) + "=" + encodeURIComponent(field.options[j].value));
        }
      } else if ((type != 'checkbox' && type != 'radio') || field.checked) {
        s.push(encodeURIComponent(name) + "=" + encodeURIComponent(field.value));
      }
    }
    return s.join('&').replace(/%20/g, '+');
  };
  uR.getQueryParameter = function getQueryParameter(name,search) {
    var regexp = new RegExp("[?&](?:"   +name+")=([^&]+)");
    var _sd = (search || window.location.search).match(regexp);
    if (_sd) { return unescape(_sd[1]); }
  };

  uR.getQueryDict = function(str) {
    str = str || window.location.search;
    var obj = {};
    str.replace(/([^=&?]+)=([^&]*)/g, function(m, key, value) {
      obj[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return obj;
  };

  uR.cookie = {
    set: function (name,value,days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
      }
      document.cookie = name+"="+value+expires+"; path=/";
    },
    get: function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
    },
    delete: function (name) { this.set(name,"",-1); }
  };

  uR.debounce = function debounce(func, wait, immediate) {
    var timeout;
    wait = wait || 200;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
      return true;
    };
  };

  uR.dedribble = function dedribble(func, wait, end_bounce) {
    var timeout;
    wait = wait || uR.config.dribble_time || 200;
    end_bounce = (end_bounce !== undefined) && true;
    var last = new Date();
    return function() {
      var context = this, args = arguments;
      if (end_bounce) {
        var later = function() {
          timeout = null;
          func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      }
      if (new Date() - last > wait) { func.apply(context, args); last = new Date(); }
    };
  };

  // this function may someday be replaced with rambdas map
  uR.forEach = function forEach(array,func,context) {
    if (context) { func = func.bind(context); }
    for (var i=0;i<array.length;i++) { func(array[i],i,array); }
  };

  // this function may someday be replaced with rambdas merge
  uR.extend = function(a,b) {
    for (var i in b) {
      if (b.hasOwnProperty(i)) { a[i] = b[i]; }
    }
  };

  uR.FALSE = "false";
  uR.REQUIRED = new Object();
  uR.DEFAULT_TRUE = new Object();
  uR.NotImplemented = (s) => "NotImplementedError: "+s;
  uR.depracated = function(f,old,alt) {
    return function() {
      console.warn(old,"is depracated in favor of",alt);
      return f.apply(this,arguments);
    };
  };
  uR.defaults = function(a,b) {
    // like extend but keeps the values of a instead of replacing them
    for (var i in b) {
      if (b.hasOwnProperty(i) && !a.hasOwnProperty(i)) { a[i] = b[i]; }
      if (a[i] == uR.REQUIRED) { throw "Attribute "+i+" is required on "+a; }
      if (a[i] == uR.DEFAULT_TRUE) { a[i] = true; }
    }
    return a;
  };

  // uR.ready is a function for handling window.onload
  uR.ready = new uR.Ready(undefined,uR._ready);
  window.onload = function() {
    uR.ready.start();
    uR.route && uR.router.ready(() => uR.route(window.location.href));
    // #! dummy route function. This is so everything can use uR.route without router.js
    uR.route = uR.route || function route(path,_data) { window.location = path; };
  };

  uR.getSchema = function getSchema(url,callback) {
    uR.ajax({
      url: url,
      success: function(data) {
        uR.schema[url] = data.schema;
        uR.schema[url].form_title = data.form_title;
        uR.schema[url].rendered_content = data.rendered_content;
        if (window.markdown && window.markdown.toHTML && data.markdown && !data.rendered_content) {
          uR.schema[url].rendered_content = markdown.toHTML(data.markdown);
        }
        uR.schema.__initial[url] = data.initial;
        uR.pagination = data.ur_pagination;
        callback && callback();
      }
    });
  };

  uR.defaults(uR, {
    icon: (i) => uR._icons[i] || "fa fa-"+i,
    onBlur: function() {},
    config: {},
    data: {},
    getRootElement: function() {
      return document.querySelector("#ur_root") || uR.newElement("div",{ id: "ur_root", parent: document.body });
    },
    _icons: {},
  });
  uR.defaults(uR.config,{
    loading_attribute: 'fade',
    tag_templates: [],
    input_overrides: {
      boolean: function() { return { tagname: 'checkbox-input', type: "checkbox" }; },
    },
    name_overrides: {},
    404: 'four-oh-four',
    doPostAuth: function() {},
    text_validators: {},
    mount_to: "#content",
    mount_alerts_to: "#alert-div",
    cancel_text: "Cancel",
    success_text: "Submit",
  });
  uR.clone = function clone(obj) { // move int ur? switch to underscore? this probably doesn't need to be deep
    return Object.assign({}, obj);
  };
  uR._var = {};
  uR.alert = function(s) { console.log(s); };//alert(s); }; // placeholder for future alert function
  uR.schema = {fields: {},__initial: {}};
  uR.urls = {};
  uR.slugify = function(s) {
    if (typeof s != "string") { s = s.toString(); }
    return s.toLowerCase().replace(/(^[\s-]+|[\s-]+$)/g,"").replace(/[^\d\w -]+/g,"").replace(/[\s-]+/g,"-");
  };
  uR.unslugify = function(s) {
    if (typeof s != "string") { s = s.toString(); }
    return s.replace(/[-_]/g," ").replace(/^(.)|\s(.)/g, ($1) => $1.toUpperCase());
  };
  uR.reverseCamelCase = function(s) {
    if (typeof s == "function") { s = s.name; }
    if (typeof s != "string") { s = s.toString(); }
    s = s.replace( /([A-Z])/g, " $1" );
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  uR.formatTimeRange = function formatTimeRange(start,end) {
    start = moment(start);
    end = moment(end);
    var start_format = start.minute()?"h:mm":"h";
    var end_format = end.minute()?"h:mm A":"h A";
    if (start.hour() < 12 && end.hour() > 12) { start_format += " A"; }
    return start.format(start_format) + " - " + end.format(end_format);
  };
  return uR;
})();
