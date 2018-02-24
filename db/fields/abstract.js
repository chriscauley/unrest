uR.db.BaseField = class BaseField extends uR.Object {
  constructor(opts) {
    super();
    this.defaults(opts,{
      editable: uR.DEFAULT_TRUE,
    });
    var parent = this.parent || {};
    this.required = this.required == undefined || this.required; // defaults to true!

    this.name = this.name || this.type;
    this.value = this.value || (parent.initial || {})[this.name] || (parent.options || {})[this.name];
    this.initial_value = this.value;
  }
  toSchema() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
    }
  }
}

uR.db.CharField = class CharField extends uR.db.BaseField {

}

uR.db.fields_map = {
  'text': uR.db.CharField,
}
