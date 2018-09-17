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
  testBtns("Subtraction",["1-1","100-0.001","-1-1","-1--1"]),
  testBtns("Multiplication",["0*5","1*5","1000*1000","0.5*0.6","0.5*0.000005","3*-4"]),
  testBtns("Division",["1/2","10/2","8/1000000","1/0"]),
)
