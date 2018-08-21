(function() {
  function isEmpty(obj) {
    for (var key in obj) { return false; }
    return true;
  }

  uR.ajax = function ajax(opts) {
    // create default options
    // note: !!form is always true, opts.form can be undefined (falsey)
    // but form.some_property will always be false if there is no form!
    // #! TODO: Everythin on tag should be moved to AjaxMixin
    var form = opts.form || {};
    var method = (opts.method || form.method || "GET").toUpperCase();
    var target = opts.target || opts.form;  // default to body?
    var url = opts.url || form.action || '.';
    window.airbrake && window.airbrake.log("AJAX: "+url);
    var that = opts.that;
    if (that) {
      console.warn('"that" has been depracated in favor of "tag".');
    }
    var tag = that || opts.tag;
    var loading_attribute = opts.loading_attribute || (tag && tag.loading_attribute) || uR.config.loading_attribute;
    var success_attribute = opts.success_attribute || "";
    var success_reset = opts.success_reset || false;
    var success = (opts.success || function(data,request) {}).bind(tag);
    var error = (opts.error || function(data,request) {}).bind(tag);
    var filenames = opts.filenames || {};
    if (tag) {
      tag.messages = opts.messages || [];
      tag._ajax_busy = true;
      tag.form_error = undefined;
      if (!target && tag.target) { console.warn("Use of tag.target is depracated in favor of tag.ajax_target") }
      target = target || tag.target || tag.ajax_target;
      if (typeof target == "string") { target = tag.root.querySelector(target) || document.querySelector(target); }
    }

    // mark as loading
    if (target) {
      target.removeAttribute("data-success");
      target.setAttribute("data-loading",loading_attribute);
    }

    // create form_data from data or form
    if (!opts.data && opts.form) {
      opts.data = {};
      uR.forEach(opts.form.elements,function(element) {
        if (element.type == "file") {
          opts.data[element.name] = element.files[0];
          filenames[element.name] = element.files[0].name;
        } else {
          opts.data[element.name] = element.value;
        }
      });
    }
    // POST uses FormData, GET uses query string
    var form_data = new FormData(opts.form);
    var _stringify = (v) =>(typeof v =="object")?JSON.stringify(v):v;
    // ^^ objects need to be turned into strings rather than [Object object]
    if (method=="POST" && opts.data) {
      for (var key in opts.data) {
        if (opts.data[key] == undefined) { continue }
        filenames[key]?form_data.append(key,opts.data[key],filenames[key]):form_data.append(key,_stringify(opts.data[key]));
      };
    }
    if (method != "POST") {
      url += (url.indexOf("?") == -1)?"?":"&";
      for (key in opts.data) {
        url += key + "=" + encodeURIComponent(_stringify(opts.data[key])) + "&";
      }
    }

    // create and send XHR
    var request = new XMLHttpRequest();
    request.open(method, url , true);
    var headers = uR.defaults(opts.headers || {}, {
      "X-Requested-With": "XMLHttpRequest",
    })
    for (var key in headers) { request.setRequestHeader(key,headers[key]); }

    if ("POSTDELETE".indexOf(method) != -1 && uR.cookie.get("csrftoken")) {
      request.setRequestHeader("X-CSRFToken",uR.cookie.get("csrftoken"));
    }
    request.onload = function(){
      try { var data = JSON.parse(request.response); }
      catch (e) {
          var data = {};
      }
      if (data.status == 401) {
        return uR.auth.loginRequired(function() { uR.ajax(opts); })();
      }
      if (target) { target.removeAttribute('data-loading'); }

      const errors = data.errors || {};
      errors.non_field_error = _.find(
        data.error, // generic "error" for the entire form
        errors.__all__, // __all__ is django default syntax
        errors.non_field_error, // my prefered syntax
      )
      if (isEmpty(errors) && request.status != 200) {
        errors.non_field_error = opts.default_error || "An unknown error has occurred";
      }

      if (tag && tag.form && tag.form.field_list) {
        uR.forEach(tag.form.field_list,function(field,i) {
          field.data_error = errors[field.name];
          if (field.data_error && data.html_errors && ~data.html_errors.indexOf(field.name)) {
            field.html_error = field.data_error
          }
          field.valid = !field.data_error;
          field.show_error = true;
        });
      }
      if (errors.non_field_error) {
        // if there's no form and no error function in opts, alert as a fallback
        if (tag) {
          tag.non_field_error = errors.non_field_error;
          tag.non_field_html_error = (data.html_errors || []).indexOf("non_field_error") != -1
        } else if (!opts.error) { uR.alert(errors.non_field_error); }
      }
      var complete = (request.status == 200 && isEmpty(errors));
      (complete?success:error)(data,request);
      uR.pagination = data.ur_pagination || uR.pagination;
      if (target && complete && !data.messages) { target.setAttribute("data-success",success_attribute) }
      if (tag) {
        tag._ajax_busy = false;
        tag.messages = data.messages || [];
        tag.update();
      }
      uR.postAjax && uR.postAjax.call(this,request);
      if (data.ur_route_to) { uR.route(data.ur_route_to); }
    };
    const is_json = headers['Content-Type'] == 'application/json'
    request.send(is_json?JSON.stringify(opts.data):form_data);
  }

  var AjaxMixin = {
    init: function() {
      this.ajax = function(options,e) {
        e = e || {};
        options.tag = options.tag || this;
        options.target = options.target || this.ajax_target || (this.theme && this.root.querySelector(this.theme.outer));
        options.target = options.target || e.target;
        options.success = options.success || this.ajax_success || uR.default_ajax_success;
        options.url = options.url || this.ajax_url;
        uR.ajax(options);
      };
    },
  };
  window.riot && riot.mixin(AjaxMixin);
  uR.default_ajax_success = function(data,request) {
    uR.extend(uR.data,data);
  }
})();
