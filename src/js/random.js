// This provides a wrapper around Math.random for a few common functions, as well as an interface to tap into a seeded RNG in order to run unit tests on anything using randomness.

// PRNG borrowed from https://gist.github.com/blixt/f17b47c62508be59987b
uR.Random = function Random(seed) {
  var _seed;

  // https://stackoverflow.com/a/7616484
  if (typeof seed == "string") { // convert string to integer
    var res = 0, len = seed.length;
    for (var i = 0; i < len; i++) {
      res = res * 31 + seed.charCodeAt(i);
      res = res & res;
    }
    console.log(seed,res)
    seed = res
  }

  const random = () => (random.raw() - 1) / 2147483646; // 0-1
  random.int = (min,max) => {
    // min-max or 0-min if no max
    return (max === undefined)?random.int(0,min):Math.floor(random()*(max-min)+min);
  }
  random.raw = raw = () => _seed = _seed * 16807 % 2147483647; // 0-2147483647
  random.choice = (array) => array[random.int(array.length)]
  random.reset = () =>  {
    _seed = seed % 2147483647;
    if (_seed <= 0) _seed += 2147483646;
  }
  random.reset();
  if (isNaN(_seed)) {
    random.raw = () => Math.floor(Math.random()*2147483647)
  }
  return random
}

uR.RandomMixin = superclass => class Random extends superclass {
  // creates a method this.random which is a PRNG based on opts._SEED or opts.parent.random
  constructor(opts={}) {
    super(opts)
    this._SEED = opts._SEED || opts.parent && opts.parent.random && opts.parent.random.raw();
    this.random = new uR.Random(this._SEED);
    console.log("seeded",this.constructor.name,this._SEED)
  }
}
