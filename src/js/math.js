uR.timeit = function timeit(f,n) {
  n = n || 100;
  var start = new Date();
  while (n--) { f() }
  return new Date()-start;
};

uR.math = {
  zeros: function zeros(n) {
    // Returns an array of zeros with length n or n.length
    n = n.length || n;
    var out = [];
    while (n--) { out[n] = 0 }
    return out;
  },
  between: (min,num,max) => Math.min(max,Math.max(min,num)),
};
