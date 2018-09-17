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
