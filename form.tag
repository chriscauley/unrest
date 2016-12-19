<image-input>
  <img if={ initial_value } src={ initial_value } />
  <input type="file" name="{ name }" onchange={ onChange }/>
  this.on("mount", function() {
    this.name = this.opts.parent._name;
    this.update();
  });
  onChange(e) {
    var files = e.target.files;
    this.opts.parent.onChange(e);
  }

</image-input>

<ur-input>
  <div class="help_click" if={ help_click } onclick={ help_click.click } title={ help_click.title }>?</div>
  <input if={ tagname == 'textinput' } type={ input_type } name={ _name } id={ id }
         onchange={ onChange } onkeyup={ onKeyUp } onfocus={ onFocus } onblur={ onBlur }
         placeholder={ placeholder } required={ required } minlength={ minlength }
         class="validate { empty:empty, invalid: invalid, active: activated } { uR.theme.input }" autocomplete="off"
         initial_value={ initial_value }>
  <textarea if={ tagname == 'textarea' } name={ _name } id={ id }
            onChange={ onChange } onKeyUp={ onKeyUp } onfocus={ onFocus } onblur={ onBlur }
            placeholder={ placeholder } required={ required } minlength={ minlength }
            class="validate { empty:empty, invalid: invalid, active: activated } { uR.theme.input }"
            autocomplete="off">{ value }</textarea>
  <select if={ tagname == 'select' } onchange={ onChange } id={ id } name={ _name } class={ uR.config.select_class }>
    <option if={ placeholder } value="">{ placeholder }</option>
    <option selected={ (choice[0]==parent.initial_value)?'selected':'' } each={ choice in choice_tuples }
            value={ choice[0] }>{ choice[1] }</option>
  </select>
  <label for={ id } if={ _label } class={ required: required } onclick={ labelClick }
         data-success={ data_success }>{ _label }</label>

  <h5 if={ tagname == 'header' }>{ content }</h5>
  <div class="help_text" if={ help_text }><i class="fa fa-question-circle-o"></i> { help_text }</div>
  <div class="error">{ data_error }</div>
  <style scoped> :scope { display: block; }</style>

  var self = this;
  onFocus(e) {
    var i = this.parent.fields.indexOf(this);
    this.activated = true;
    if (i != 0) { this.parent.fields[i-1].show_errors = true; }
  }

  onBlur(e) {
    var i = this.parent.fields.indexOf(this);
    if (i !=0 && this.parent.active) { this.show_errors = true; }
    uR.onBlur(this);
    this.last_value = undefined; // force re-validation
    this.activated = !!this.value;
    this.onChange(e);
  }

  labelClick(e) {
    if (self.input_type == "checkbox") {
      self.IS_CHECKED = !self.IS_CHECKED;
      e.value = self.value;
      self.onChange(e);
    }
  }

  onChange(e) {
    if (self.parent.active) { self.show_errors = true; }
    self.onKeyUp(e);
  }

  onKeyUp(e) {
    if (this.no_validation) { return; }
    if (e.type == "keyup") { this.parent.active = true; }
    this.value = e.value || e.target.value; // e.value is a way to fake events
    if (this.last_value == this.value && this.input_type != "checkbox") { return; }
    if (self.input_type == "checkbox") {
      self.root.querySelector("[type=checkbox]").checked = self.IS_CHECKED;
    }
    this.last_value = this.value;
    this.data_error = undefined;
    this.empty = !this.value;
    var invalid_email = !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(this.value);
    if (!this.required && !this.value) { invalid_email = false; }
    var has_value = (this.type == "checkbox")?this.IS_CHECKED:this.value.length;
    if (this.required && !has_value) {
      this.data_error = "This field is required.";
    }
    else if (this.value.length < this.minlength) {
      var type = (["number","tel"].indexOf(this.type) == -1)?" characters.":" numbers.";
      this.data_error = this.verbose_name + " must be at least " + this.minlength + type;
    }
    else if (this.type == "email" && invalid_email) {
      this.data_error = "Please enter a valid email address.";
    }
    if (!this.data_error && e.type == "blur") { this._validate(this.value,this); }
    //this.update();
  }

  this.reset = function() {
    var target = self.root.querySelector("input,select,textarea");
    if (!target || ['checkbox','radio','submit'].indexOf(target) != -1) {
      return; //#! TODO this should reset based off of initial values
    }
    self.show_errors = false;
    self.value = self.initial_value || "";
    self.activated = (self.value != "") || self.input_type == "select" || self.input_type == "file";
    target.value = self.value;
    self.onKeyUp({target:target});
    self.update()
    self.parent.update();
  }

  this.on("mount", function() {
    // name is kind of a reserved word for riot since <element name="some_name"> appears as this.some_name
    // if the schema.name == "name" then it causes massive issues
    this.name = this.name || this.type;
    this._name = (typeof(this.name) == "object")?this.name[0]:this.name;
    this.verbose_name = this.verbose_name || this.label || this.placeholder;
    if (!this.verbose_name) {
      var f = function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();};
      this.verbose_name = this._name.replace(/[-_]/g," ").replace(/\w\S*/g, f);
    }
    this._label = this.label || this.verbose_name;
    this.id = this.id || "id_" + this._name + this.parent.suffix;
    this.input_type = this.type || "text";
    this.validate = this.validate || function() {};
    if (uR.config.text_validators[this.input_type]) {
      this.validate = uR.config.text_validators[this.input_type];
      this.input_type = "text";
    }
    if (this.required == undefined) { this.required = true; }
    this._validate = (this.bounce)?uR.debounce(this.validate,this.bounce):this.validate;
    this.show_errors = false;
    this.tagname = "textinput";
    this.IS_CHECKED = self.initial_checked;
    // #! TODO this next ugliness needs to be fixed at the materialize level
    this.form_class = (this.input_type == "checkbox")?"":uR.config.form.field_class;
    if (this.input_type == "hidden") {
      this.root.style.display = "none";
      this._label = "";
    }
    if (this.input_type == "select") {
      this.tagname = "select";
      if (this.placeholder) { this._label = undefined };
      function setChoices() {
        if (!self.choice_tuples) {
          self.verbose_choices = self.verbose_choices || self.choices;
          self.choice_tuples = [];
          for (var i=0;i<self.choices.length;i++) {
            self.choice_tuples.push([self.choices[i],self.verbose_choices[i]]);
          }
        }
        self.update();
        self.root.querySelector("select").value = self.initial_value;
      }
      if (!this.choices_url) { setChoices(); }
      else {
        uR.storage.remote(this.choices_url,function(choices) {
          self.choice_tuples = [];
          uR.forEach(choices,function (choice) {
            self.choice_tuples.push([choice[self.value_key || 0],choice[self.verbose_key] || 1]);
          });
          setChoices();
          self.update();
        });
      }
    }
    if (this.input_type == "textarea") { this.tagname = "textarea"; }
    if (this.input_type == "header") {
      this.tagname = "header";
      this.content = this._label;
      this._label = undefined;
      this.no_validation = true;
    }
    if (uR.config.tag_templates.indexOf(this.input_type) != -1) {
      this.tagname = this.input_type;
      var _e = document.createElement(this.input_type);
      this.root.insertBefore(_e,this.root.firstChild);
      setTimeout(function() { riot.mount(_e,{parent:self,form: self.parent}); },0);
    }
    if (this.parent && this.parent.fields) { this.parent.fields.push(this); }

    // This interval validates the fields after autocomplete, since there's no easy way to handle it via js
    var i_tries = 0;
    var interval = setTimeout(function() {
      var e = document.querySelector("#"+self.id);
      i_tries += 1;
      if (e && (i_tries++ > 5 || e.value)) {
        clearInterval(interval);
        self.onKeyUp({target: e});
      }
    },1000);
    self.monkey = 1;
    this.update();
    this.reset();
    this.onMount && setTimeout(this.onMount,0);
    if (this.extra_attrs) {
      for (k in this.extra_attrs) {
        this.root.querySelector("input").setAttribute(k,this.extra_attrs[k])
      }
    }
    if (this.label_after) {
      var s = document.createElement("span");
      s.innerHTML = this.label_after;
      this.root.appendChild(s);
    }
  });
  this.on("update", function() {
    this.invalid = this.data_error && this.show_errors;
  });
</ur-input>

<ur-form>
  <form autocomplete="off" onsubmit={ submit } name="form_element" class={ opts.form_class } method={ opts.method }>
    <yield from="pre-form"/>
    <ur-input each={ schema } class="{ name } { type } { form_class }"/>
    <div if={ non_field_error }>
      <div class={ uR.theme.error_class }>{ non_field_error }</div>
      <p if={ uR.config.support_email } style="text-align: center;">
        If you need assistance contact
        <a href="mailto:{ uR.config.support_email }">{ uR.config.support_email }</a>
      </p>
    </div>
    <div class="button_div">
      <yield from="button_div"/>
      <button class="{ btn_success } { disabled: !valid }" id="submit_button" onclick={ submit }>{ success_text }</button>
      <button class="{ btn_cancel }" if={ opts.cancel_function } onclick={ opts.cancel_function }>{ cancel_text }</button>
    </div>
    <ul class="messagelist" if={ messages.length }>
      <li class="{ level }" each={ messages }>{ body }</li>
    </ul>
  </form>

  var self = this;
  this.btn_success = this.opts.btn_success || uR.config.btn_success;
  this.btn_cancel = this.opts.btn_cancel || uR.config.btn_cancel;
  this.cancel_text = this.opts.cancel_text || uR.config.cancel_text;

  submit(e,_super) {
    if (this._ajax_busy) { return; }
    if (!this.valid) {
      uR.forEach(this.fields,function (field) {
        field.show_errors = true;
        field.update();
      })
      return;
    }
    // _super is a temporary hack to allow us to call the original submit function.
    this.non_field_error = undefined;
    var alt_submit = this.opts.submit || (this.parent && this.parent.submit);
    if (!_super && alt_submit) {
      if (alt_submit == "noop") {
        var form = this.root.querySelector("form");
        var e = document.createElement('input');
        e.type = "hidden";
        e.name = "csrfmiddlewaretoken";
        e.value = document.querySelector("[name=csrfmiddlewaretoken]").value;
        form.appendChild(e);
        form.submit()
      }
      else { alt_submit(this); }
    } else {
      uR.ajax({
        url: this.opts.action,
        method: this.opts.method,
        form: this.form_element,
        success: this.ajax_success,
        success_attribute: this.opts.success_attribute,
        error: this.ajax_error,
        target: this.submit_button,
        that: self
      });
    }
  }
  clear() {
    uR.forEach(this.fields, function(field) { field.reset(); })
    this.messages = [];
    self.active = false;
    setTimeout(function() {
      var f = self.root.querySelector("input:not([type=hidden]),select,textarea"); f && f.focus();
    },0)
  }

  this.addField = function(field) {
    var f = {};
    if (typeof field == "string") {
      var name = field;
      if (uR.schema.fields[field]) {
        field = uR.schema.fields[field];
        field.name = name;
      } else {
        field = { name: field, type: 'text' }
      }
    }
    for (k in field) { f[k] = field[k]; }
    if (f.type == "checkbox") {
      f.value = true;
      f.initial_value = f.value;
      f.initial_checked = self.initial[f.name];
    } else {
      f.initial_value = f.value || self.initial[f.name];
    }
    self.schema.push(f);
  }
  getData() {
    var data = {};
    uR.forEach(this.fields,function(f) { data[f._name] = f.value });
    return data;
  }
  this.on("mount",function() {
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
    this.messages = [];
    var _schema = this.opts.schema || _parent.opts.schema || _parent.schema;
    if (typeof _schema == "string") {
      this.schema_url = _schema;
      if (uR.schema[this.schema_url]) {
        _schema = uR.schema[this.schema_url];
      } else {
        var url = _schema;
        uR.getSchema(url,this.mount.bind(this));
        _schema = [];
        return;
      }
    }
    this.schema = [];
    this.initial = uR.schema.__initial[this.schema_url] || this.opts.initial || _parent.opts.initial || {};
    uR.forEach(_schema,this.addField);
    this.suffix = this.opts.suffix || "";
    this.success_text = this.opts.success_text || "Submit";
    this.fields = [];
    this.update();
    if (this.fields.length && !opts.no_focus) {
      setTimeout(function() {
        var f = self.root.querySelector("input:not([type=hidden]),select,textarea");
        f && f.focus();
        (self.opts.post_focus || function() {})(self);
      },0)
    }
  });
  this.on("update",function() {
    if (this._multipart) { this.form_element.enctype='multipart/form-data'; }
    this.valid = true;
    uR.forEach(this.fields || [],function(field,i) {
      if (field.no_validation) { return }
      self.valid = self.valid && !field.data_error;
    })
    //this.parent && this.parent.update();
  });
</ur-form>

<ur-formset>
  <ur-form each={ form,i in forms } suffix={ "_"+i } success_text="Add">
    <div class="message font-20" if={ next }>
      <b>{ name }</b> has been successfully added!<br /> Add more children or click <b>Next</b> to continue.
    </div>
  </ur-form>
  <button class={ uR.config.btn_primary } disabled={ !valid }>Next</button>
  var self = this;
  this.forms = [];
  this.on("mount",function() {
    this.forms.push({schema:this.opts.schema});
    this.update();
  });
  submit (element) {
    var form_data = {}
    for (var key in element.inputs) { form_data[key] = element.inputs[key].value }
    uR.ajax({
      method: "POST",
      url: this.opts.action,
      data: form_data,
      target: element.root,
      self: element,
      loading_attribute: "mask",
      success: function(data) { element.name = form_data.name; self.update();}
    });
  }
</ur-formset>
