function testBtns(name,keys_array) {
  function f(){
    for (let keys of keys_array) {
      for (let key of keys) { this.click(`[data-key="${key}"]`); }
      this.checkResults("calculator .display .input");
      this.checkResults("calculator .display .output");
    }
  }
  f._name = name;
  return f
}

konsole.addCommands(
  testBtns("Addition",["1+1","2+5","3.999+1","8+0"]),
)
