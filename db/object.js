uR.Object = class Object {
  constructor(opts) {
  }
  defaults(opts,_defaults) {
    uR.extend(
      this,
      uR.defaults(opts || {},_defaults)
    );
  }
}
