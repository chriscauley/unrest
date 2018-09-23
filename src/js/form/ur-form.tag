<ur-form>
  <div class={ theme.outer }>
    <div class={ theme.header } if={ form_title }><h3>{ form_title }</div>
    <div class={ theme.content }>
      <div class="rendered_content"></div>
      <form autocomplete="off" onsubmit={ submit } name="form_element" class={ opts.form_class } method={ opts.method }>
        <yield from="pre-form"/>
        <div each={ _f, i in form && form.field_list || [] } class="{ _f.className } { ur_empty: _f.empty, invalid: !_f.valid && _f.show_error, active: _f.activated || !_f.empty } ur-input" data-field_id={ id }>
          <div data-is={ _f.tagname } field={ _f } form={ form } is_ur_input={ true }></div>
          <div class="help_click" if={ _f.help_click } onclick={ _f.help_click.click } title={ _f.help_click.title }>?</div>
          <label for={ _f.id } if={ _f.label } class={ required: required } onclick={ _f.labelClick }
                 data-success={ _f.data_success }>{ _f.label }</label>
          <div class={ uR.css.error }>{ _f.data_error }</div>
          <div class="help_text" if={ _f.help_text }><i class="fa fa-question-circle-o"></i> { _f.help_text }</div>
        </div>
        <div if={ non_field_error } class="non_field_error" data-field_id="non_field_error">
          <div each={ e in non_field_error } class={ uR.css.error }>{ e }</div>
          <p if={ uR.config.support_email } style="text-align: center;">
            If you need assistance contact
            <a href="mailto:{ uR.config.support_email }">{ uR.config.support_email }</a>
          </p>
        </div>
        <div class="button_div">
          <yield from="button_div"/>
          <button class="{ btn_success } { disabled: !valid }" id="submit_button" onclick={ submit }>
            { success_text }</button>
          <button class="{ btn_cancel }" if={ opts.cancel_function } onclick={ opts.cancel_function }>
            { cancel_text }</button>
        </div>
        <ul class="messagelist" if={ messages && messages.length }>
          <li class="{ level }" each={ messages }>{ body }</li>
        </ul>
      </form>
      <div class="post-form"></div>
    </div>
  </div>

  var self = this;
  this.btn_success = this.opts.btn_success || uR.css.btn.success;
  this.btn_cancel = this.opts.btn_cancel || uR.css.btn.cancel;
  this.cancel_text = this.opts.cancel_text || uR.config.cancel_text;
  this.success_text = this.opts.success_text || "Submit";
  this.onChange = this.opts.onChange;
  this.suffix = this.opts.suffix || "";

  submit(e,_super) {
    e && e.preventDefault && e.preventDefault()
    if (this._ajax_busy || !this.form.field_list.length) { return; }
    if (!this.valid) {
      uR.forEach(this.form.field_list,function (field) { field.show_error = true; });
      this.update();
      return;
    }
    // _super is a temporary hack to allow us to call the original submit function.
    this.non_field_error = undefined;
    var alt_submit = this.opts.submit || (this.parent && this.parent.submit);
    if (!_super && alt_submit) {
      if (alt_submit == "noop") {
        var form = this.root.querySelector("form");
        if (form.method == "POST" && document.querySelector("[name=csrfmiddlewaretoken]")) {
          var e = document.createElement('input');
          e.type = "hidden";
          e.name = "csrfmiddlewaretoken";
          e.value = document.querySelector("[name=csrfmiddlewaretoken]").value;
          form.appendChild(e);
        }
        form.submit()
      }
      else { alt_submit(this); }
    } else {
      uR.ajax({
        url: this.form.action,
        method: this.opts.method,
        data: this.getData(),
        success: this.ajax_success,
        success_attribute: this.opts.success_attribute,
        error: this.ajax_error,
        tag: self,
      });
    }
  }

  clear() {
    this.initial = this.empty_initial;
    uR.storage.set(this.form.action,null); // nuke stored half finished form
    this.form.field_list.forEach( field => {
      field.initial_value = this.initial[field.name];
      field.child && field.child.clear && field.child.clear();
      field.reset();
    })
    this.messages = [];
    this.active = false;
    setTimeout(() => {
      var f = this.root.querySelector("input:not([type=hidden]),select,textarea"); f && f.focus();
    },0)
  }

  getData() {
    var data = {};
    uR.forEach(this.form.field_list,(f) => { data[f.name] = f.value || ""; });
    this.opts.process_data && this.opts.process_data(data);
    return data;
  }

  this.on("mount",function() {
    uR.form.current = this;
    var _parent = this.parent || {};
    _parent.ur_form = this;
    _parent.opts = _parent.opts || {};
    this.ajax_success = this.opts.ajax_success || _parent.opts.ajax_success || _parent.ajax_success || function() {};
    if (this.opts.success_redirect) {
      // #!TODO, maybe remove this in favor of data.next
      this._ajax_success = this.ajax_success;
      this.ajax_success = function() { self._ajax_success();window.location = this.opts.success_redirect; }
    }
    this.ajax_error = this.opts.ajax_error || _parent.opts.ajax_error || _parent.ajax_error || function() {};
    this.ajax_target = this.opts.ajax_target || this.submit_button;
    this.form = new uR.form.URForm(this);
    this.update();
    this.update();
    this.root.style.opacity = 1;
    if (this.opts.autosubmit) {
      this.root.querySelector("#submit_button").style.display = "none";
      (this.opts.autosubmit == "first") && this.onChange({},true);
    }
    this.form.postMount();
  });

  onChange(e,force) {
    if (this._ajax_busy) { return }
    if (!this.opts.autosubmit) { return; }
    var changed;
    uR.forEach(this.form.field_list || [], function(field) {
      changed = changed || field.changed;
      field.changed = false;
    });
    if (changed || force) {
      this.update(); // check to see if valid
      this.submit(); // does nothing if invalid
    }
  }

  this.on("update",function() {
    if (this.root.querySelectorAll(".ur-input").length == 0) { return; }
    if (this._multipart) { this.form_element.enctype='multipart/form-data'; }
    this.valid = true;
    if (!this.form.field_list) { return }
    uR.forEach(this.form.field_list,function(field,i) {
      if (field.html_error) {
        var error_element = this.root.querySelector("[data-field_id="+field.id+"] .error")
        if (field.id && error_element) {
          error_element.innerHTML = field.html_error;
        }
      }
      if (field.no_validation) { return }
      self.valid = self.valid && field.valid;
    }.bind(this));
    if (self.non_field_error && self.non_field_html_error) {
      setTimeout(function() { // #! TODO none_field_error should always be there so that timeout is not necessary
        if (self.root.querySelector("[data-field_id=non_field_error]")) {
          self.root.querySelector("[data-field_id=non_field_error]").innerHTML = self.non_field_error;
        }
      },0);
    }
    this.opts.autosave && this.autoSave();
    if (this.rendered_content) {
      // this gets lazy loaded via schema url, so needs to be here rather than in mount
      this.root.querySelector(".rendered_content").innerHTML = this.rendered_content;
      this.rendered_content = undefined; // don't do it twice
    }
  });

  this.autoSave = uR.dedribble(function() {
    // #! TODO Performance test this. Is it a memory leak? Is it using a lot of processor?
    var new_data = this.getData();
    //if (this.__data == new_data) { return; } // can't compare objects like this
    uR.storage.set(this.form.action,new_data);
  }.bind(this),1000);
</ur-form>
