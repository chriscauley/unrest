console.log('what');

function changeElement(element,value) {
  element.value = value
  element.dispatchEvent(new Event("change"));
  element.dispatchEvent(new Event("keyup"));
  element.dispatchEvent(new Event("blur"));
}
function testRequiredElement(name,initial) {
  var element = document.querySelector("[name="+name+"]");
  var root = document.querySelector("ur-input."+name);
  it(element.name+" has correct initial value", function() {
    expect(element.value).to.equal(initial);
  });
  it(name+" raises errors on required elements", function() {
    changeElement(element,"");
    expect(root.querySelector(".error")).to.exist;
    expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.true;
    expect(root.querySelector(".invalid")).to.exist;
  });
  it(name+" removes error and enables form when given initial value", function() {
    changeElement(element,initial);
    expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.false;
    expect(root.querySelector(".invalid")).to.not.exist;
  })
}

function testNonRequiredElement(name,initial) {
  var element = document.querySelector("[name="+name+"]");
  var root = document.querySelector("ur-input."+name);
  it(element.name+" has no initial value", function() {
    expect(element.value).to.equal("");
  });
  it(name+" has no errors when empty", function() {
    expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.false;
    expect(root.querySelector(".invalid")).to.not.exist;
  });
  it(name+" still has no errors when given a value", function() {
    changeElement(element,initial);
    expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.false;
    expect(root.querySelector(".invalid")).to.not.exist;
  });
}  

describe("DOM Tests", function () {
  uR.mountElement("ur-form",{schema:SCHEMA,initial: INITIAL});
  for (var name in INITIAL) {
    testRequiredElement(name,INITIAL[name]);
  }
});
