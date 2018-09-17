function testBtns(name,keys_array) {
  function f() {
    this.do(`Testing ${name} buttons`).route("#calculator-demo")
    for (let keys of keys_array) {
      this.do(keys).click('[data-key="C"]')
      for (let key of keys) { this.click(`[data-key="${key}"]`); }
      this.checkResults("calculator .display");
    }
  }
  f._name = name;
  return f
}

konsole.addCommands(
  testBtns("Addition",["1+1","2+5","3.999+1","8+0"]),
)
