var uR = (function() {
  function serialize(form) {
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
  function getQueryParameter(name) {
    var regexp = new RegExp("[\?&](?:"   +name+")=([^&]+)");
    var _sd = window.location.search.match(regexp);
    if (_sd) { return _sd[1]; }
  }

  cookie = {
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
    delete: function (name) { createCookie(name,"",-1); }
  }

  function isEmpty(obj) {
    for (key in obj) { return false; }
    return true;
  }

  function ajax(opts) {
    // create default options
    var type = opts.type || "GET";
    var data = opts.data;
    var target = opts.target || opts.form;
    var url = opts.url || opts.form.action;
    var loading_attribute = opts.loading_attribute || "";
    var success_attribute = opts.success_attribute || "";
    var success_reset = opts.success_reset || false;
    var that = opts.that;
    var success = (opts.success || function(data,request) {}).bind(that);
    var error = (opts.error || function(data,request) {}).bind(that);
    var filenames = opts.filenames || {};
    if (that) { that.messages = opts.messages || []; }

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
    if (type=="POST") {
      for (var key in data) {
        filenames[key]?form_data.append(key,data[key],filenames[key]):form_data.append(key,data[key]);
      };
    }
    else {
      url += "?"
      for (key in data) { url += key + "=" + data[key] + "&" }
    }

    // create and send XHR
    var request = new XMLHttpRequest();
    request.open(type, url , true);
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    if (type == "POST" && document.querySelector("[name=csrfmiddlewaretoken]")) {
      request.setRequestHeader("X-CSRFToken",document.querySelector("[name=csrfmiddlewaretoken]").value);
    }
    request.onload = function(){
      try { var data = JSON.parse(request.response); }
      catch (e) {
          var data = {};
      }
      if (target) { target.removeAttribute('data-loading'); }
      var errors = data.errors || {};
      if (isEmpty(errors) && request.status != 200) {
        var e = opts.default_error || "An unknown error has occurred";
        errors = { non_field_errors: e };
      }
      if (that && that.fields) {
        that.non_field_errors = [];
        forEach(that.fields,function(field,i) {
          if (errors[field.name]) { field.errors.push(errors[field.name]); }
        });
      }
      if (that && errors.non_field_errors) { that.non_field_errors = [errors.non_field_errors]; }

      var complete = (request.status == 200 && isEmpty(errors));
      (complete?success:error)(data,request);
      if (target && complete && !data.messages) { target.setAttribute("data-success",success_attribute) }
      if (that) {
        that.messages = data.messages || [];
        that.update();
      }
    };
    request.send(form_data);
  }

  function debounce(func, wait, immediate) {
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

  function dedribble(func, wait, end_bounce) {
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

  function forEach(array,func) {
    for (var i=0;i<array.length;i++) { func(array[i],i,array); }
  }

  return {
    serialize: serialize,
    ajax: ajax,
    debounce: debounce,
    forEach: forEach,
    dedribble: dedribble,
    cookie: cookie,
    getQueryParameter: getQueryParameter,
    onBlur: function() {},
    config: {},
  }
})();
