describe("DOM Tests", function () {
  uR.auth.reset = function() {};
  function changeElement(element,value) {
    element.value = value
    element.dispatchEvent(new Event("change"));
    element.dispatchEvent(new Event("keyup"));
    element.dispatchEvent(new Event("blur"));
  }
  var SCHEMA = [
    "name",
    "email",
    {name: 'select_color', type: 'select', choices: ['red','green','blue']},
  ];
  var INITIAL = {
    name: "bob",
    email: "arst@arst.com",
    select_color: 'red',
  };
  uR.mountElement("ur-form",{schema:SCHEMA,initial: INITIAL});

  it("has all values equal to initial value", function() {
    for (var name in INITIAL) {
      console.log(2);
      var selector = "[name="+name+"]";
      var element = document.querySelector(selector);
      console.log(selector);
      expect(element.value).to.equal(INITIAL[name]);
    }
  });

  for (var name in INITIAL) {
    it(name+" raises errors on required elements", (function(name) {
      return function() {
        var selector = "[name="+name+"]";
        var element = document.querySelector(selector);
        var root = document.querySelector("ur-input."+name);
        changeElement(element,"");
        expect(root.querySelector(".error")).to.exist;
        expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.true;
        expect(root.querySelector(".invalid")).to.exist;
        changeElement(element,INITIAL[name]);
        expect(document.querySelector("#submit_button").classList.contains("disabled")).to.be.false;
        expect(root.querySelector(".invalid")).to.not.exist;
      }
    })(name));
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
