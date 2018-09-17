// This provides a wrapper around Math.random for a few common functions, as well as an interface to tap into a seeded RNG in order to run unit tests on anything using randomness.

// #! TODO getNextSeed seems to be spawning duplicates... not sure if this is statistically significant
// uR._random_seeds = {}
// uR._analyzeRandom = () => {
//   var dups = {},
//       total = 0,
//       count = 0;
//   for (var k in uR._random_seeds) {
//     if (uR._random_seeds[k] >1) { dups[k] = uR._random_seeds[k]; count++ }
//     total += 1
//   }
//   console.log(count,total,dups);
// }


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
    seed = res;
  }

  // #! TODO see _analyzeRandom
  // uR._random_seeds[seed] = (uR._random_seeds[seed] || 0) + 1;
  const random = () => (random.raw() - 1) / 2147483646; // 0-1
  random.int = (min,max) => {
    // min-max or 0-min if no max
    return (max === undefined)?random.int(0,min):Math.floor(random()*(max-min)+min);
  };
  random.raw = raw = () => _seed = _seed * 16807 % 2147483647; // 0-2147483646
  random.choice = (array) => array[random.int(array.length)];
  random.reset = () =>  {
    _seed = seed % 2147483647;
    if (_seed <= 0) _seed += 2147483646;
  };
  random.reset();
  if (isNaN(_seed)) { // seed was neither string or number... pick a truely random seed
    random.raw = () => Math.floor(Math.random()*2147483647);
  }
  random.seed = seed;
  random.getNextSeed = () => {
    return random.raw()%8191;// 2^13-1...because why not?
  };
  random.shuffle = (array) => {
    var i = array.length, temp, i_rand;
    // While there remain elements to shuffle...
    while (0 !== i) {
      // Pick a remaining element...
      i_rand = Math.floor(random() * i);
      i -= 1;
      // And swap it with the current element.
      temp = array[i];
      array[i] = array[i_rand];
      array[i_rand] = temp;
    }
    return array;
  };
  /* #! TODO
     for some reason the first draw off of random.choice seems to always be the first
     element of the array for the first roll of random. I can't figure it out and so
     I really need some serious stats on this... but not today */
  random();
  return random;
};

uR.RandomMixin = superclass => class Random extends superclass {
  // creates a method this.random which is a PRNG based on opts._SEED or opts.parent.random
  constructor(opts={}) {
    super(opts);
    this._SEED = opts._SEED || opts.seed;
    if (opts._prng) { this._SEED = opts._prng.random.getNextSeed(); }
    this.random = new uR.Random(this._SEED);
  }
};
