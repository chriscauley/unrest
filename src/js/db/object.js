uR.Object = class Object {
  constructor(opts) {
    this._id = this.constructor.name+Math.random();
  }
  defaults(opts,_defaults) {
    uR.extend(
      this,
      uR.defaults(opts || {},_defaults)
    );
  }
  forEach(array,func) {
    func = func.bind(this);
    uR.forEach(array,func);
  }
}

uR.RandomObject = uR.RandomMixin(uR.Object)