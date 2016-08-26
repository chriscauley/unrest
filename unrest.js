var uR = (function() {
  var uR = window.uR || {};

  uR.serialize = function serialize(form) {
    var field, s = [];
    if (typeof form != 'object' && form.nodeName != "FORM") { return }
    var len = form.elements.length;
    for (i=0; i<len; i++) {
      field = form.elements[i];
      if (!field.name || field.disabled || field.type == 'file' || field.type == 'reset' ||
          field.type == 'submit' || field.type == 'button') { continue }
      if (field.type == 'select-multiple') {
        for (j=form.elements[i].options.length-1; j>=0; j--) {
          if(field.options[j].selected)
            s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[j].value);
        }
      } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
        s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value);
      }
    }
    return s.join('&').replace(/%20/g, '+');
  }
  uR.getQueryParameter = function getQueryParameter(name) {
    var regexp = new RegExp("[\?&](?:"   +name+")=([^&]+)");
    var _sd = window.location.search.match(regexp);
    if (_sd) { return _sd[1]; }
  }

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
  }

  function isEmpty(obj) {
    for (key in obj) { return false; }
    return true;
  }

  uR.ajax = function ajax(opts) {
    // create default options
    // note: !!form is always true, opts.form can be undefined (falsey)
    // but form.some_property will always be false if there is no form!
    var form = opts.form || {};
    var method = (opts.method || form.method || "GET").toUpperCase();
    var data = opts.data;
    var target = opts.target || opts.form;  // default to body?
    var url = opts.url || form.action || '.';
    var loading_attribute = opts.loading_attribute || uR.config.loading_attribute;
    var success_attribute = opts.success_attribute || "";
    var success_reset = opts.success_reset || false;
    var that = opts.that;
    var success = (opts.success || function(data,request) {}).bind(that);
    var error = (opts.error || function(data,request) {}).bind(that);
    var filenames = opts.filenames || {};
    if (that) {
      that.messages = opts.messages || [];
      that._ajax_busy = true;
      that.form_error = undefined;
    }

    // mark as loading
    if (target) {
      target.removeAttribute("data-success");
      target.setAttribute("data-loading",loading_attribute);
    }

    // create form_data from data or form
    if (!data && opts.form) {
      data = {};
      uR.forEach(opts.form.elements,function(element) {
        if (element.type == "file") {
          data[element.name] = element.files[0];
          filenames[element.name] = element.files[0].name;
        } else {
          data[element.name] = element.value;
        }
      });
    }
    // POST uses FormData, GET uses query string
    var form_data = new FormData();
    if (method=="POST") {
      for (var key in data) {
        filenames[key]?form_data.append(key,data[key],filenames[key]):form_data.append(key,data[key]);
      };
    }
    else {
      url += (url.indexOf("?") == -1)?"?":"&";
      for (key in data) { url += key + "=" + data[key] + "&" }
    }

    // create and send XHR
    var request = new XMLHttpRequest();
    request.open(method, url , true);
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    if (method == "POST" && document.querySelector("[name=csrfmiddlewaretoken]")) {
      request.setRequestHeader("X-CSRFToken",document.querySelector("[name=csrfmiddlewaretoken]").value);
    }
    request.onload = function(){
      try { var data = JSON.parse(request.response); }
      catch (e) {
          var data = {};
      }
      if (target) { target.removeAttribute('data-loading'); }
      var errors = data.errors || {};
      var non_field_error = errors.non_field_error;
      if (isEmpty(errors) && request.status != 200) {
        non_field_error = opts.default_error || "An unknown error has occurred";
      }
      if (that && that.fields) {
        uR.forEach(that.fields,function(field,i) {
          field.error = errors[field.name];
        });
      }
      if (non_field_error) {
        if (that) {that.non_field_error = non_field_error; } else { alert(non_field_error); }
      }

      var complete = (request.status == 200 && isEmpty(errors));
      (complete?success:error)(data,request);
      if (target && complete && !data.messages) { target.setAttribute("data-success",success_attribute) }
      if (that) {
        that._ajax_busy = false;
        that.messages = data.messages || [];
        that.update();
      }
    };
    request.send(form_data);
  }

  uR.debounce = function debounce(func, wait, immediate) {
    var timeout, wait = wait || 200;
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
  }

  uR.dedribble = function dedribble(func, wait, end_bounce) {
    var timeout, wait = wait || 200, end_bounce = end_bounce && true ;
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

  uR.forEach = function forEach(array,func) {
    for (var i=0;i<array.length;i++) { func(array[i],i,array); }
  }

  // uR.ready is a function for handling window.onload
  uR._ready = [];
  uR.ready = function(func) { uR._ready.push(func); };
  window.onload = function() {
    for (var i=0;i<uR._ready.length;i++) { uR._ready[i]() }
    uR.ready = function(func) { func(); }
  }

  uR.onBlur = uR.onBlur || function() {};
  uR.config = uR.config || {};
  uR.config.form = {};
  uR.config[404] = 'four-oh-four';
  uR.config.form.field_class = "input-field";
  uR.config.loading_attribute = uR.config.loading_attribute || 'spinner';
  uR.config.loading_attribute = 'spinner';
  uR.config.success_attribute = 'spinner';
  uR.config.select_class = 'browser-default';
  uR.config.tag_templates = [];
  uR.config.text_validators = {};
  uR.config.mount_to = "body";
  uR.config.mount_alerts_to = "#alert-div";
  uR.schema = {};
  return uR;
})();
