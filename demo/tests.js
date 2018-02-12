function testStorage() {
  this.do()
    .then(function checkSet() {
      uR.storage.set("setKey",1);
      uR.storage.set("removedKey",1);
      uR.storage.remove("removedKey");
      return uR.storage.get("setKey") == 1 && !uR.storage.has("removedKey")
    })
    .reloadWindow()
    .then(function checkStorage() {
      return uR.storage.get("setKey") == 1
    })
    .then(function checkRemove() {
      return !uR.storage.has("removedKey")
    })
}

function testStorageDefault() {
  var store = new uR.Storage("TestStorageDefault");
  store.getDefault("test",1)
  store.getDefault("test2",2,"integer")
  store.getDefault("test2",3) // doesn't override
  store.getDefault("default1now3",1)
  function allValid() {
    return store.get("test") == 1 && store.get("test2") == 2 && store.get('default1now3') == 3;
  }
  this.do()
    .then(function storeValuesInStorage() {
      store.set('default1now3',3); // override
      return true;
    })
    .then(allValid)
    .reloadWindow()
    .then(allValid)
    .checkResults(function getData() { return store.getData() })
    .checkResults(function getSchema() { return store.getSchema() })
    .checkResults(function setSchema() {
      return store.setSchema([
        {name: "A", _default: 'a'},
        {name: "OneIsInt", _default: 1, type: 'integer'}
      ]);
    })
}


function testForm() {
  this.do("ur-form tests")
    .setPath("#ur-form-demo")
    .wait("#id_first_name")
    .wait(0) // #! TODO 
    .checkResults("ur-form-demo ur-form")
    .changeValue("#id_first_name","Testy")
    .changeValue("#id_last_name","Larou")
    .changeValue("#id_email","testy@example.com")
    .checkResults("ur-form-demo ur-form")
    .done("ur-form is great!")
}

function testTabs() {
  this.do("testing basic tabs functionality")
    .wait("[href='#tabs-demo']")
    .click()
    .wait("#content ur-tabs")
    .checkResults()
    .done("tabs have not changed")
}

function testMarkdown() {
  this.do("testing markdown")
    .wait("[href='#markdown-demo']")
    .wait(2000)
    .click()
    .wait(2000)
    .wait("#content markdown")
    .wait(2000)
    .checkResults()
    .wait(2000)
    .done("markdown has not changed")
}

function testCalendar() {
  this.do("testing calendar")
    .wait("[href='#calendar-demo']")
    .click()
    .wait("#content calendar")
    .checkResults()
    .done("calendar has not changed")
}

konsole.addCommands(
  testStorage,testStorageDefault,
  testForm,testTabs,testMarkdown,testCalendar);
