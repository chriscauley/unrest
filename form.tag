(function() {
  uR.form = {};
  uR.ready(function() {
    if (uR.config.form_prefix != undefined) {
      var _routes = {};
      _routes[uR.config.form_prefix + "/([\\w]+\\.[\\w]+)/"] = function(path,data) {
        data.schema = "/api/schema/"+data.matches[1]+"/";
        data.method = "POST"; // #! TODO this should be an option tied to python schema
        uR.mountElement("ur-form",data);
      };
      uR.addRoutes(_routes);
    }
  });
  uR.__START = new Date().valueOf();
  uR._t = function(s) { console.log(new Date().valueOf()-uR.__START,s); }
  uR.form.parseChoices = function(choices) {
    // #! TODO This should eventually accomodate groupings as well like:
    // choices = [["group_name",[choice1,choice2,choice3]...],group2,group3]
    return choices.map(function(c) {
      if (typeof(c) == "string") { return [c,c]}
      return c;
    });
  }
  riot.mixin({ // anything with a ur-input like tag needs the following
    init: function() {
      if (!this.opts.is_ur_input) { return }
      this.field = this.opts.field;
      this.on("mount",function() {
        setTimeout(this.field.reset.bind(this.field),0);
      });
    }
  });
  uR.form.URForm = class URForm {
    constructor(ur_form) {
      this.form_tag = ur_form;
      this.opts = ur_form.opts;
      this.messages = [];
      this.prepSchema();
    }
    prepSchema() {
      var tag = this.form_tag;
      var _schema = tag.opts.schema || tag._parent.opts.schema || tag._parent.schema;
      this.action = tag.opts.action;
      if (typeof _schema == "string") {
        this.schema_url = _schema;
        this.action = this.action || this.schema_url;
        if (uR.schema[this.schema_url]) {
          _schema = uR.schema[this.schema_url];
        } else {
          var url = _schema;
          uR.getSchema(url,this.prepSchema.bind(this));
          _schema = [];
          return;
        }
      }
      this.empty_initial = uR.schema.__initial[this.schema_url] || this.form_tag.opts.initial || {};
      this.initial = uR.storage.get(this.form_tag.action) || this.empty_initial || {};

      tag.form_title = _schema.form_title;
      this.schema = _schema.map(function(field) {
        if (typeof field == "string") { field = { name: field } }
        var f = {};
        for (var k in field) { f[k] = field[k] }
        return f;
      });
      this.field_list = [];
      this.fields = {};
      uR.forEach(this.schema, function(field,i) {
        field.tagname = uR.config.input_overrides[field.type] || "ur-input";
        field._field_index = this.field_list.length;
        var cls = uR.form.fields[field.tagname] || uR.form.fields["ur-input"];
        this.field_list.push(new cls(this,field));
        this.fields[field.name] = this.field_list[this.field_list.length-1];
      }.bind(this));
      /*
      this.update();
      this.update();
      if (this.fields.length && !opts.no_focus) {
        setTimeout(function() {
          var f = self.root.querySelector("input:not([type=hidden]),select,textarea");
          f && f.focus();
          (self.opts.post_focus || function() {})(self);
        },0)
        }
      */
    }
    renderFields() {
      if (this._fields_rendered) { return }
      this._fields_rendered = true;
      var targets = this.form_tag.root.querySelectorAll(".ur-input");
      uR.forEach(this.field_list,function(field,i) {
        targets[i].insertBefore(field.field_tag.root,targets[i].firstElementChild);
      });
      this.opts.onload && this.opts.onload.bind(this)();
      this.active = true; // form can now show errors
    }
  }

  uR.form.URInput = class URInput {
    constructor(form,options) {
      this.tag_name = this.tag_name || "ur-input"; // can be overridden by sub-classes
      this.form = form;
      if (typeof options == "string") {
        var name = options;
        if (uR.schema.fields[options]) {
          options = uR.schema.fields[options];
          options.name = name;
        } else {
          options = { name: name, type: 'text' }
        }
      }
      for (var k in options) { this[k] = options[k]; }
      this.required = this.required == undefined || this.required; // defaults to true!

      this.name = this.name || this.type;
      if (typeof(this.name) == "object") { // can't remember when this is used
        console.warn("look at me!")
        this.name = (typeof(this.name) == "object")?this.name[0]:this.name;
      }
      this.value = this.initial_value = this.value || (this.form.initial || {})[this.name];
      this.valid = true;
      // verbose_name is useful for error messages, other generated text
      this.verbose_name = this.verbose_name || this.label || this.placeholder;
      if (!this.verbose_name) {
        var replace = function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();};
        this.verbose_name = (this.name || "").replace(/[-_]/g," ").replace(/\w\S*/g, replace);
      }
      this.label = this.label || this.verbose_name;
      this.id = this.id || "id_" + this.name + this.form.form_tag.suffix;
      this.input_tagname = this.input_tagname || (this.type == "textarea")?this.type:"input";
      this.input_type = this.type || "text";

      // if there's a validator, use type=text to ignore browser default
      if (uR.config.text_validators[this.input_type]) {
        this.validate = uR.config.text_validators[this.input_type];
        this.input_type = "text";
      }

      // It's easier to have an empty function than undefined, also make bouncy
      this.validate = this.validate || function() { return true };
      //#! TODO: rethink bouncy validators as some kind of promise
      //this.validate = (this.bounce)?uR.debounce(this.validate.bind(f),this.bounce):this.validate;
      this.keyUp = this.keyUp || function() {};
      this.keyUp = (this.bounce)?uR.debounce(this.keyUp.bind(f),this.bounce):this.keyUp;

      // universal choice parser, maybe move to uR.form?
      if (this.choices) {
        this.choices = uR.form.parseChoices(this.choices).map(function(choice_tuple,index) {
          return {
            label: choice_tuple[1],
            id: this.id+"__"+index,
            value: uR.slugify(choice_tuple[0]),
          }
        }.bind(this));
      }
      this.className = this.name + " " + this.type + " " + uR.config.form.field_class;
      var element = document.createElement(this.tagname);
      this.field_tag = riot.mount(element,{ field: this, parent: this.form, is_ur_input: true })[0];
    }

    onKeyUp(e) {
      if (this.no_validation) { return; }
      if (e.type == "keyup") { self.active = true; }
      this.value = e.value || (e.target && e.target.value) || ""; // e.value is a way to fake events
      this.changed = this.last_value == this.value;
      this.last_value = this.value;
      this.empty = !this.value.length;
      var invalid_email = !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(this.value);
      if (!this.required && !this.value) { invalid_email = false; }
      var was_valid = this.valid;
      this.valid = false;
      if (!this.required && this.empty) {
        this.valid = true;
      }
      else if (this.required && this.empty) {
        this.data_error = "This field is required.";
      }
      else if (this.value.length < this.minlength) {
        var type = (["number","tel"].indexOf(this.type) == -1)?" characters.":" numbers.";
        this.data_error = this.verbose_name + " must be at least " + this.minlength + type;
      }
      else if (this.type == "email" && invalid_email) {
        this.data_error = "Please enter a valid email address.";
      }
      else if (!this.validate(this.value,this)) { } //everything is handled in the function
      else {
        this.valid = true;
      }
      if (was_valid != this.valid) { this.form.form_tag.update() }
      this.form.form_tag.onChange(e);
      //#! if (!this.data_error) { this.opts.ur_form.keyUp(this) }
      //#! if (!this.data_error && e.type == "blur") { this._validate(this.value,this); }
    }

    onFocus(e) {
      // activate and show error for last field (if not first)
      this.activated = true;
      var last = this.form.field_list[this._field_index-1];
      if (last) {
        last.show_error = true;
      }
      this.form.form_tag.update();
    }

    onBlur(e) {
      // deactivate, force reevaluation, show errors
      uR.onBlur(this);
      this.activated = false;
      this.last_value = undefined; // trigger re-evaluation
      this.onChange(e);
      this.form.form_tag.update();
    }

    onChange(e) {
      if (this.form.active) { this.show_error = true; }
      this.form.onChange && this.form.onChange(e,this);
      this.onKeyUp(e);
    }
    reset() {
      this.show_error = false;
      this.value = this.initial_value || "";
      var target;
      if (this.field_tag && this.input_tagname) {
        target = this.field_tag.root.querySelector(this.input_tagname);
        target.value = this.value;
      }
      this.onKeyUp({target:target});
      this.activated = this.value != "";
      this.field_tag.update();
    }
  }
  uR.form.fields = {
    'ur-input': uR.form.URInput,
  }
})();

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
  <!--<input type={ field.type } name={ field.name } id={ field.id }
         onchange={ onChange } onkeyup={ onKeyUp } onfocus={ onFocus } onblur={ onBlur }
         placeholder={ placeholder } required={ required } minlength={ minlength }
         class="validate { empty:empty, invalid: invalid, active: activated || !empty } { uR.theme.input }"
         autocomplete="off">-->

  var self = this;

  this.on("mount", function() {
    this._input = document.createElement(this.field.input_tagname);
    if (this.field.input_tagname != "textarea") { this._input.type = this.field.input_type; }
    this._input.name = this.field.name;
    this._input.id = this.field.id;
    this._input.addEventListener("change",this.field.onChange.bind(this.field));
    this._input.addEventListener("focus",this.field.onFocus.bind(this.field));
    this._input.addEventListener("blur",this.field.onBlur.bind(this.field));
    this._input.addEventListener("keyup",this.field.onKeyUp.bind(this.field));
    this._input.classList.add(uR.theme.input);
    if (this.field.input_type == "header") {
      this._input.style.display = "none";
      this.field.required = false;
    }
    if (this.input_type == "hidden") {
      this.root.style.display = "none";
      this.label = "";
    }
    this.root.appendChild(this._input);

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
    this.field.onMount && setTimeout(this.field.onMount.bind(this.field),0);
    if (this.extra_attrs) {
      for (k in this.extra_attrs) {
        this.root.querySelector("input").setAttribute(k,this.extra_attrs[k])
      }
    }
    this.update()
  });
</ur-input>

<ur-form>
  <div class={ theme.outer }>
    <div class={ theme.header } if={ form_title }><h3>{ form_title }</div>
    <div class={ theme.content }>
      <form autocomplete="off" onsubmit={ submit } name="form_element" class={ opts.form_class } method={ opts.method }>
        <yield from="pre-form"/>
        <div each={ form.field_list } class="{ className } { empty: empty, invalid: !valid && show_error, active: activated || !empty } ur-input">
          <div class="help_click" if={ help_click } onclick={ help_click.click } title={ help_click.title }>?</div>
          <label for={ id } if={ label } class={ required: required } onclick={ labelClick }
                 data-success={ data_success }>{ label }</label>
          <div class="error">{ data_error }</div>
          <div class="help_text" if={ help_text }><i class="fa fa-question-circle-o"></i> { help_text }</div>
        </div>
        <div if={ non_field_error } class="non_field_error">
          <div class={ uR.theme.error_class }>{ non_field_error }</div>
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
        <ul class="messagelist" if={ messages.length }>
          <li class="{ level }" each={ messages }>{ body }</li>
        </ul>
      </form>
    </div>
  </div>

  var self = this;
  this.btn_success = this.opts.btn_success || uR.config.btn_success;
  this.btn_cancel = this.opts.btn_cancel || uR.config.btn_cancel;
  this.cancel_text = this.opts.cancel_text || uR.config.cancel_text;
  this.success_text = this.opts.success_text || "Submit";
  this.onChange = this.opts.onChange;
  this.suffix = this.opts.suffix || "";

  submit(e,_super) {
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
        tag: self
      });
    }
  }

  clear() {
    this.initial = this.empty_initial;
    uR.storage.set(this.form.action,null); // nuke stored half finished form
    uR.forEach(this.form.field_list, function(field) {
      field.initial_value = self.initial[field.name];
      field.child && field.child.clear && field.child.clear();
      field.reset();
    })
    this.messages = [];
    self.active = false;
    setTimeout(function() {
      var f = self.root.querySelector("input:not([type=hidden]),select,textarea"); f && f.focus();
    },0)
  }

  getData() {
    var data = {};
    uR.forEach(this.form.field_list,function(f) { data[f.name] = f.value || ""; });
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
    this.ajax_target = this.opts.ajax_target || this.submit_button;
    this.form = new uR.form.URForm(this);
    this.update();
    this.update();
    this.root.style.opacity = 1
    if (this.opts.autosubmit) {
      this.root.querySelector("#submit_button").style.display = "none";
      (this.opts.autosubmit == "first") && this.onChange({},true);
    }
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
    this.form.renderFields();
    if (this._multipart) { this.form_element.enctype='multipart/form-data'; }
    this.valid = true;
    if (!this.form.field_list) { return }
    uR.forEach(this.form.field_list,function(field,i) {
      if (field.no_validation) { return }
      self.valid = self.valid && field.valid;
    })
    this.opts.autosave && this.autoSave();
  });

  this.autoSave = uR.dedribble(function() {
    // #! TODO Performance test this. Is it a memory leak? Is it using a lot of processor?
    var new_data = this.getData();
    //if (this.__data == new_data) { return; } // can't compare objects like this
    uR.storage.set(this.form.action,new_data);
  }.bind(this),1000);
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
      url: this.form.action,
      data: form_data,
      target: element.root,
      self: element,
      loading_attribute: "mask",
      success: function(data) { element.name = form_data.name; self.update();}
    });
  }
</ur-formset>
