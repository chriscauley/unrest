uR.config.tag_templates.push("ur-datetime");

<ur-datetime>
  <input name={ _name } type="hidden" />
  <div class="input_field">
    <div class="row">
      <div class="col s4">
        <input type="text" name="{ _name }__date" placeholder="MM-DD-YYYY" onchange={ validate }>
      </div>
      <div class="col s4">
        <input type="text" name="{ _name }__time" placeholder="HH:MM" onchange={ validate }>
      </div>
      <div class="col s4">
        <div class="switch">
          <label>
            AM
            <input type="checkbox" name="{ _name }__pm" onchange={ validate }>
            <span class="lever"></span>
            PM
          </label>
        </div>
      </div>
    </div>
    <div class="error" if={ invalid_date }>Invalid date. Use MM-DD-YYYY</div>
    <div class="error" if={ invalid_time }>Invalid date. Use HH:MM</div>
  </div>

  this.on("mount", function() {
    this.root.classList.add("active");
    this.update();
    if (this.initial_value) {
      this.initial_value = this.initial_value.replace("T"," ");
      this.initial_value = this.initial_value.replace(":00Z","");
      console.log(this.initial_value);
      var initial = moment(this.initial_value,"YYYY-MM-DD HH:mm");
      console.log(initial);
      this.root.querySelector("[name="+this._name+"__date]").value = initial.format("MM-DD-YYYY");
      this.root.querySelector("[name="+this._name+"__time]").value = initial.format("h:mm");
      var pm = this.root.querySelector("[name="+this._name+"__pm]").checked = initial.hour() > 11;
    }
  });
  validate(e) {
    var date = this.root.querySelector("[name="+this._name+"__date]").value;
    var time = this.root.querySelector("[name="+this._name+"__time]").value;
    var pm = this.root.querySelector("[name="+this._name+"__pm]").checked?"pm":"am";
    this.invalid_date = !moment(date).isValid;
    this.invalid_time = !moment(date).isValid;
    this.setValue();
    if (this.invalid_date || this.invalid_time) { return }
    this.setValue(moment(date+" "+time+" "+pm).format("MM-DD-YYYY HH:mm"));
  }
</ur-datetime>
