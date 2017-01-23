function changeElement(element,value) {
  element.value = value
  element.dispatchEvent(new Event("change"));
  element.dispatchEvent(new Event("keyup"));
  element.dispatchEvent(new Event("blur"));
}
function testElement(element,initial) {
  var name = element.name;
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

describe("DOM Tests", function () {
  uR.auth.reset = function() {};
  var SCHEMA = [
    "name",
    "email",
    {name: 'select_color', type: 'select', choices: ['red','green','blue']},
    {name: "diet_checkboxes", type: "checkbox-input", choices: ['vegan','vegetarian','kosher','gluten-free']},
  ];
  var INITIAL = {
    name: "bob",
    email: "arst@arst.com",
    select_color: 'red',
    diet_checkboxes: 'vegan',
  };
  uR.mountElement("ur-form",{schema:SCHEMA,initial: INITIAL});
  for (var name in INITIAL) {
    testElement(document.querySelector("[name="+name+"]"),INITIAL[name]);
  }

  // test required vs unrequired elements

  // test unrequired elements

  // var el = document.createElement("div");
  // el.id = "myDiv";
  // el.innerHTML = "Hi there!";
  // el.style.background = "#ccc";
  // document.body.appendChild(el);
  
  // var myEl = document.getElementById('myDiv');
  // it("is in the DOM", function () {
  //   expect(myEl).to.not.equal(null);
  // });
  
  // it("is a child of the body", function () {
  //   expect(myEl.parentElement).to.equal(document.body);
  // });
  
  // it("has the right text", function () {
  //   expect(myEl.innerHTML).to.equal("Hi there!");
  // });
  
  // it("has the right background", function () {
  //   expect(myEl.style.background).to.equal("rgb(204, 204, 204)");
  // });
});
