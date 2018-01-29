// This provides a wrapper around Math.random for a few common functions, as well as an interface to tap into a seeded RNG in order to run unit tests on anything using randomness.

uR.random = Math.random;
uR.randint = function(lo,hi) {
  if (hi === undefined) { hi=lo; lo = 0; }
  return Math.floor(uR.random()*(hi-lo+1) + lo);
}
uR.random.choice = function(array) { return array[uR.randint(array.length-1)] }
uR.random.analyze = function(func,n) {
  // useful for checking distribution on a function that uses random.
  n = n || 1000000;
  var out = {},r;
  while (n--) {
    r = func();
    out[r] = (out[r] || 0) + 1;
  }
  return out;
}
uR.random._seed = function(seed) {
  if (!uR.rng) { console.warn("no random number generator installed"); return; }
  uR._active_rng = uR.rng.create(seed);
  var random = uR._active_rng.random;
  random.choice = uR.random.choice;
  random.randint = uR.random.randint;
  random.analyze = uR.random.analyze;
  random._seed = function() { console.warn("Seed already set. Ignoring new seed") };
  uR.random = random;
}
