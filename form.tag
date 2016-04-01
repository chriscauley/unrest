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
  <label for={ id } if={ label } class={ required: required }>{ label }</label>
  <div class="help_text" if={ help_text } onclick={ help_text }>?</div>
  <input if={ tagname == "textinput" } type={ type } name={ _name } id={ id }
         onChange={ onChange } onKeyUp={ onKeyUp } onfocus= { onFocus } onblur= { onBlur }
         placeholder={ placeholder } required={ required } minlength={ minlength } valid={ !errors.length }
         class={ empty:empty } value={ initial_value } autocomplete="off" checked={ checked }>
  <textarea if={ tagname == "textarea" } type={ type } name={ _name } id={ id }
            onChange={ onChange } onKeyUp={ onKeyUp } onfocus= { onFocus } onblur= { onBlur }
            placeholder={ placeholder } required={ required } minlength={ minlength } valid={ !errors.length }
            class={ empty:empty } autocomplete="off" checked={ checked }>{ initial_value }</textarea>
  <select if={ tagname == "select" } onchange={ onChange } id={ id } name={ _name }>
    <option if={ placeholder } value="">{ placeholder }</option>
    <option selected={ (choice[0]==parent.initial_value)?'selected':'' } each={ choice in choice_tuples } value={ choice[0] }>{ choice[1] }</option>
  </select>
  <ul class="errorlist" if={ errors.length && show_errors}>
    <li class="error fa-exclamation-circle fa" each={ error in errors }> { error }</li>
  </ul>

  var self = this;

  onFocus(e) {
    var i = this.parent.fields.indexOf(this);
    if (i != 0) { this.parent.fields[i-1].show_errors = true; }
  }

  onBlur(e) {
    var i = this.parent.fields.indexOf(this);
    if (i !=0) { this.show_errors = true; }
    uR.onBlur(this);
    this.last_value = undefined; // force re-validation
    this.onChange(e);
  }

  onKeyUp(e) {
    if (this.show_errors && this.errors.length) { this.onChange(e); }
  }

  onChange(e) {
    this.show_errors = true;
    var value = e.target.value;
    if (this.last_value == value) { return; }
    this.last_value = value;
    this.errors = [];
    this.empty = !value;
    var invalid_email = !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
    if (!this.required && !value) { invalid_email = false; }
    if (this.required && !value.length) {
      this.errors.push(this.verbose_name + " is required.");
    }
    else if (value.length < this.minlength) {
      var type = (["number","tel"].indexOf(this.type) == -1)?" characters.":" numbers.";
      this.errors.push(this.verbose_name + " must be at least " + this.minlength + type);
    }
    else if (this.type == "email" && invalid_email) {
      this.errors.push("Please enter a valid email address.")
    }
    if (!this.errors.length && e.type == "blur") { this._validate(value,this); }
    this.update();
  }

  this.reset = function() {
    var i = self.root.querySelector("input,select,textarea");
    if (['checkbox','radio','submit'].indexOf(i.type) != -1) {
      return; //#! TODO this should reset based off of initial values
    }
    i.blur();
    self.show_errors = false;
    i.value = self.initial_value || "";
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("keyup", false, true);
    i.dispatchEvent(evt);
  }

  this.on("mount", function() {
    // name is kind of a reserved word for riot since <element name="some_name"> appears as this.some_name
    // if the schema.name == "name" then it causes massive issues
    this._name = (typeof(this.name) == "object")?this.name[0]:this.name;
    this.verbose_name = this.verbose_name || this.label || this.placeholder;
    if (!this.verbose_name) {
      var f = function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();};
      this.verbose_name = this._name.replace(/[-_]/g," ").replace(/\w\S*/g, f);
    }
    if (!this.label) { this.placeholder = this.placeholder || this.verbose_name; }
    this.id = this.id || "id_" + this._name + this.parent.suffix;
    this.validate = this.validate || function() {};
    this.type = this.type || "text";
    if (this.required == undefined) { this.required = true; }
    this._validate = (this.bounce)?uR.debounce(this.validate,this.bounce):this.validate;
    this.initial_value = this.initial_value || "";
    this.onChange({target:{value:this.initial_value}});
    this.show_errors = false;
    this.tagname = "textinput";
    if (this.type == "select") {
      this.tagname = "select";
      this.verbose_choices = this.verbose_choices || this.choices;
      this.choice_tuples = [];
      for (var i=0;i<this.choices.length;i++) {
        this.choice_tuples.push([this.choices[i],this.verbose_choices[i]]);
      }
    }
    if (this.type == "textarea") { this.tagname = "textarea"; }
    if (this.type == "image-input") {
      this.tagname = "image-input";
      var _e = document.createElement("image-input");
      this.root.appendChild(_e);
      riot.mount(_e,{parent:this});
      this.parent._multipart = true;
    }
    if (this.parent && this.parent.fields) { this.parent.fields.push(this); }

    // This interval validates the fields after autocomplete, since there's no easy way to handle it via js
    var i_tries = 0;
    var interval = setTimeout(function() {
      var e = document.querySelector("#"+self.id);
      i_tries += 1;
      if (e && (i_tries++ > 5 || e.value)) {
        clearInterval(interval);
        self.onChange({target: e});
      }
    },1000);
    this.update();
  });
  this.on("update", function() {
    if (!this.parent.inputs) { this.parent.inputs = {} }
    if (this.id) { this.parent.inputs[this._name] = document.getElementById(this.id); }
    this.parent.update();
  });
</ur-input>

<ur-form>
  <form autocomplete="off" onsubmit={ submit } name="form_element" class={ opts.form_class }>
    <ur-input each={ schema } class="{ name } { type }"/>
    <div class="button_div">
      <ul class="errorlist" if={ non_field_errors.length }>
        <li class="error fa-exclamation-circle fa" each={ error in non_field_errors }> { error }</li>
        <li>
          If you need assistance contact
          <a href="mailto:support@homerapp.com">support@homerapp.com</a>
        </li>
      </ul>
      <yield/>
      <button disabled={ !valid } class="btn { button_class }" id="submit_button">{ button_text }</button>
    </div>
    <ul class="messagelist" if={ messages.length }>
      <li class="{ level }" each={ messages }>{ body }</li>
    </ul>
  </form>

  var self = this;
  this.button_class = this.opts.button_class || uR.config.button_class || "";

  submit(e) {
    this.non_field_errors = [];
    if (this.parent.submit) {
      this.parent.submit(this);
    } else {
      uR.ajax({
        url: this.opts.action,
        type: this.opts.method,
        form: this.form_element,
        success: this.ajax_success,
        success_attribute: this.opts.success_attribute,
        target: this.submit_button,
        that: self
      });
    }
  }
  clear() {
    uR.forEach(this.fields, function(field) { field.reset(); })
  }

  this.addField = function(field) {
    var f = {};
    for (k in field) { f[k] = field[k] }
    f.initial_value = f.value || self.initial[f.name];
    self.schema.push(f);
  }
  this.on("mount",function() {
    this.ajax_success = this.opts.ajax_success || this.parent.opts.ajax_success || this.parent.ajax_success || function() {};
    this.messages = [];
    var _schema = this.opts.schema || this.parent.opts.schema || this.parent.schema;
    this.schema = [];
    this.initial = this.opts.initial || {};
    uR.forEach(_schema,this.addField);
    this.suffix = this.opts.suffix || "";
    this.button_text = this.opts.button_text || "Submit";
    this.fields = [];
    this.update();
    if (this.fields) { setTimeout(function() {self.root.querySelector("input").focus() },0) }
  });
  this.on("update",function() {
    if (this._multipart) { this.form_element.enctype='multipart/form-data'; }
    this.valid = true;
    this.hide_errors = false;
    uR.forEach(this.fields || [],function(field,i) {
      self.valid = self.valid && !field.errors.length;
      // hide errors unless a field with errors is marked as show_errors
      self.hide_errors = self.hide_errors && !field.errors.length && !field.show_errors;
    })
    this.parent.update();
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
  this.schema = HOMER.schema.child;
  this.on("mount",function() {
    this.forms.push({schema:HOMER.schema.child});
    this.update();
  });
  submit (element) {
    var form_data = {}
    for (var key in element.inputs) { form_data[key] = element.inputs[key].value }
    uR.ajax({
      type: "POST",
      url: this.opts.action,
      data: form_data,
      target: element.root,
      self: element,
      loading_attribute: "mask",
      success: function(data) { element.name = form_data.name; self.update();}
    });
  }
</ur-formset>
