(function() {
  uR.form.URInput = class URInput {
    constructor(form,opts={}) {
      opts.tagname = opts.tagname || "ur-input"; // can be overridden by sub-classes
      opts.form = form;
      _.extend(this,uR.schema.prepFieldOptions(opts));

      this.valid = true;
      // if there's a validator, use type=text to ignore browser default
      if (uR.config.text_validators[this.name]) {
        this.validate = uR.config.text_validators[this.name];
        this.input_type = "text";
      }

      // It's easier to have an empty function than undefined, also make bouncy
      this.validate = this.validate || function() { return true; };
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
      var type;
      if (!this.required && this.empty) {
        this.valid = true;
      }
      else if (this.required && this.empty) {
        this.data_error = "This field is required.";
      }
      else if (this.value.length < this.minlength) {
        type = (["number","tel"].indexOf(this.type) == -1)?" characters.":" numbers.";
        this.data_error = this.verbose_name + " must be at least " + this.minlength + type;
      }
      else if (this.maxlength && this.value.length > this.maxlength) {
        type = (["number","tel"].indexOf(this.type) == -1)?" characters.":" numbers.";
        this.data_error = this.verbose_name + " cannot be more than " + this.maxlength + type;
      }
      else if (this.type == "email" && invalid_email) {
        this.data_error = "Please enter a valid email address.";
      }
      else if (!this.validate(this.value,this)) {
        this.valid = false; //everything is handled in the function
      } else {
        this.valid = true;
      }
      if (was_valid != this.valid) { this.form.form_tag.update(); }
      this.form.form_tag.onChange(e);
      //#! if (!this.data_error) { this.opts.ur_form.keyUp(this) }
      //#! if (!this.data_error && e.type == "blur") { this._validate(this.value,this); }
    }

    onFocus(_event) {
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
  };
  uR.form.fields = {
    'ur-input': uR.form.URInput,
  };
})();
