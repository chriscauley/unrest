(function() {
  uR.form.URInput = class URInput {
    constructor(form,opts={}) {
      opts.tagname = opts.tagname || "ur-input"; // can be overridden by sub-classes
      opts.form = form;
      _.extend(this,uR.schema.prepFieldOptions(opts))

      this.valid = true;
      // if there's a validator, use type=text to ignore browser default
      if (uR.config.text_validators[this.name]) {
        this.validate = uR.config.text_validators[this.name];
        this.input_type = "text";
      }

      // It's easier to have an empty function than undefined, also make bouncy
      this.validate = this.validate || function() { return true };
      //#! TODO: rethink bouncy validators as some kind of promise
      //this.validate = (this.bounce)?uR.debounce(this.validate.bind(f),this.bounce):this.validate;
      this.keyUp = this.keyUp || function() {};
      this.keyUp = (this.bounce)?uR.debounce(this.keyUp.bind(f),this.bounce):this.keyUp;
    }

    onKeyUp(e) {
      if (this.no_validation) { return; }
      if (e.type == "keyup") { self.active = true; }
      this.value = e.value || (e.target && e.target.value) || ""; // e.value is a way to fake events
      if (this.type == "datetime-local") {
        this.value = this.value && moment(this.value).format("YYYY-MM-DD HH:mm");
      }
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
      else if (this.maxlength && this.value.length > this.maxlength) {
        var type = (["number","tel"].indexOf(this.type) == -1)?" characters.":" numbers.";
        this.data_error = this.verbose_name + " cannot be more than " + this.maxlength + type;
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
      this.onKeyUp(e); // triggers validation, etc
      this.form.form_tag && this.form.form_tag.onChange && this.form.form_tag.onChange(e,this);
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

<ur-input>
  <!--<input type={ field.type } name={ field.name } id={ field.id }
         onchange={ onChange } onkeyup={ onKeyUp } onfocus={ onFocus } onblur={ onBlur }
         placeholder={ placeholder } required={ required } minlength={ minlength }
         class="validate { ur_empty:empty, invalid: invalid, active: activated || !empty } { uR.css.form.input }"
         autocomplete="off">-->

  var self = this;
  this.on("before-mount",function() {
    this.field = this.opts.field;
    this.field.field_tag = this;
  });
  this.on("mount", function() {
    this._input = document.createElement(this.field.input_tagname);
    if (this.field.input_tagname != "textarea") { this._input.type = this.field.input_type; }
    this._input.name = this.field.name;
    this._input.id = this.field.id;
    this._input.addEventListener("change",this.field.onChange.bind(this.field));
    this._input.addEventListener("focus",this.field.onFocus.bind(this.field));
    this._input.addEventListener("blur",this.field.onBlur.bind(this.field));
    this._input.addEventListener("keyup",this.field.onKeyUp.bind(this.field));
    this._input.classList.add(uR.css.form.input);
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
