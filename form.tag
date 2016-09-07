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

<checkbox-input>
  <input type="checkbox" name="{ name }" value="1" id="{ id }">
  <label for="{ id }" if="{ label }">{ label }</label>
  this.on("mount", function() {
    this.label = this.opts.parent.label;
    this.name = this.opts.parent._name;
    this.id = this.opts.parent.id;
    this.update();
  });
</checkbox-input>

<ur-input>
  <div class="help_click" if={ help_click } onclick={ help_click.click } title={ help_click.title }>?</div>
  <input if={ tagname == "textinput" } type={ input_type } name={ _name } id={ id }
         onChange={ onChange } onKeyUp={ onKeyUp } onfocus={ onFocus } onblur= { onBlur }
         placeholder={ placeholder } required={ required } minlength={ minlength }
         class="validate { empty:empty, invalid: invalid }" autocomplete="off" checked={ checked }
         initial_value={ set_value }>
  <label for={ id } if={ label } class={ required: required, active: activated }
         data-error={ data_error } data-success={ data_success }>{ label }</label>
  <!-- I'm unsure why but this breaks internet explorer, disabling for now because it's not used
  <textarea if={ tagname == "textarea" } name={ _name } id={ id }
            onChange={ onChange } onKeyUp={ onKeyUp } onfocus= { onFocus } onblur= { onBlur }
            placeholder={ placeholder } required={ required } minlength={ minlength }
            class={ empty:empty } autocomplete="off">{ value }</textarea>
  -->
  <select if={ tagname == "select" } onchange={ onChange } id={ id } name={ _name } class={ uR.config.select_class }>
    <option if={ placeholder } value="">{ placeholder }</option>
    <option selected={ (choice[0]==parent.value)?'selected':'' } each={ choice in choice_tuples }
            value={ choice[0] }>{ choice[1] }</option>
  </select>
  <h5 if={ tagname == "header" }>{ content }</h5>
  <div class="help_text" if={ help_text }><i class="fa fa-question-circle-o"></i> { help_text }</div>
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

  onChange(e) {
    if (this.parent.active) { this.show_errors = true; }
    this.onKeyUp(e);
  }

  onKeyUp(e) {
    if (this.no_validation) { return; }
    if (e.type == "keyup") { this.parent.active = true; }
    this.value = e.value || e.target.value; // e.value is a way to fake events
    if (this.last_value == this.value) { return; }
    this.last_value = this.value;
    this.data_error = undefined;
    this.empty = !this.value;
    var invalid_email = !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(this.value);
    if (!this.required && !this.value) { invalid_email = false; }
    if (this.required && !this.value.length) {
      this.data_error = this.verbose_name + " is required.";
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
    var i = self.root.querySelector("input,select,textarea");
    if (['checkbox','radio','submit'].indexOf(i.type) != -1) {
      return; //#! TODO this should reset based off of initial values
    }
    i.blur();
    self.show_errors = false;
    self.value = self.set_value = self.initial_value || "";
    self.root.querySelector("input,select").value = self.value;
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("keyup", false, true);
    i.dispatchEvent(evt);
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
    this.label = this.label || this.verbose_name;
    this.id = this.id || "id_" + this._name + this.parent.suffix;
    this.input_type = this.type || "text";
    this.validate = this.validate || function() {};
    if (uR.config.text_validators[this.input_type]) {
      this.validate = uR.config.text_validators[this.input_type];
      this.input_type = "text";
    }
    if (this.required == undefined) { this.required = true; }
    this._validate = (this.bounce)?uR.debounce(this.validate,this.bounce):this.validate;
    this.set_value = this.value = this.initial_value = this.initial_value || "";
    this.onKeyUp({target:{value:this.initial_value}});
    this.show_errors = false;
    this.tagname = "textinput";
    if (this.input_type == "select") {
      this.tagname = "select";
      if (!this.choice_tuples) {
        this.verbose_choices = this.verbose_choices || this.choices;
        this.choice_tuples = [];
        for (var i=0;i<this.choices.length;i++) {
          this.choice_tuples.push([this.choices[i],this.verbose_choices[i]]);
        }
      }
    }
    if (this.input_type == "textarea") { this.tagname = "textarea"; }
    if (this.input_type == "header") {
      this.tagname = "header";
      this.content = this.label;
      this.label = undefined;
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
    this.update();
  });
  this.on("update", function() {
    this.invalid = this.data_error && this.show_errors;
  });
</ur-input>

<ur-form>
  <form autocomplete="off" onsubmit={ submit } name="form_element" class={ opts.form_class }>
    <yield from="pre-form"/>
    <ur-input each={ schema } class="{ name } { type } { uR.config.form.field_class }"/>
    <div class="button_div">
      <div if={ non_field_error }>
        <div class="card red white-text"><div class="card-content">{ non_field_error }</div></div>
        <p if={ uR.config.support_email }>
          If you need assistance contact
          <a href="mailto:{ uR.config.support_email }">{ uR.config.support_email }</a>
        </p>
      </div>
      <yield from="button_div"/>
      <button class="btn { button_class } { disabled: !valid }" id="submit_button">{ button_text }</button>
      <button class="btn { cancel_class }" if={ opts.cancel_function } tab-index="0">{ cancel_text }</button>
    </div>
    <ul class="messagelist" if={ messages.length }>
      <li class="{ level }" each={ messages }>{ body }</li>
    </ul>
  </form>

  var self = this;
  this.button_class = this.opts.button_class || uR.config.button_class || "";
  this.cancel_class = this.opts.cancel_class || uR.config.cancel_class || "";
  this.cancel_text = this.opts.cancel_text || uR.config.cancel_text || "";

  submit(e,_super) {
    if (this._ajax_busy || !this.valid) { return; }
    // _super is a temporary hack to allow us to call the original submit function.
    this.non_field_error = undefined;
    if (!_super && this.parent && this.parent.submit) {
      this.parent.submit(this);
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
    for (k in field) { f[k] = field[k]; }
    if (f.type == "checkbox") {
      f.initial_value = f.value;
      f.checked = self.initial[f.name];
    } else {
      f.initial_value = f.value || self.initial[f.name];
    }
    self.schema.push(f);
  }
  this.on("mount",function() {
    var _parent = this.parent || {};
    _parent.ur_form = this;
    _parent.opts = _parent.opts || {};
    this.ajax_success = this.opts.ajax_success || _parent.opts.ajax_success || _parent.ajax_success || function() {};
    if (this.opts.success_redirect) {
      this._ajax_success = this.ajax_success;
      this.ajax_success = function() { self._ajax_success();window.location = this.opts.success_redirect; }
    }
    this.ajax_error = this.opts.ajax_error || _parent.opts.ajax_error || _parent.ajax_error || function() {};
    this.messages = [];
    var _schema = this.opts.schema || _parent.opts.schema || _parent.schema;
    if (typeof _schema == "string") {
      if (uR.schema[_schema]) {
        _schema = uR.schema[_schema];
      } else {
        var url = _schema;
        uR.ajax({
          url: url,
          success: function(data) {
            uR.schema[url] = data;
            self.mount()
          }
        });
        _schema = [];
      }
    }
    this.schema = [];
    this.initial = this.opts.initial || _parent.opts.initial || {};
    uR.forEach(_schema,this.addField);
    this.suffix = this.opts.suffix || "";
    this.button_text = this.opts.button_text || "Submit";
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
  <ur-form each={ form,i in forms } suffix={ "_"+i } button_text="Add">
    <div class="message font-20" if={ next }>
      <b>{ name }</b> has been successfully added!<br /> Add more children or click <b>Next</b> to continue.
    </div>
  </ur-form>
  <button class="btn btn-blue" disabled={ !valid }>Next</button>
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
