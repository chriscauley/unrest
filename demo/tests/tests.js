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

function testConfig() {
  var config = new uR.Config("TestStorageDefault");
  config.getDefault("test",1)
  config.getDefault("test2",2,"integer")
  config.getDefault("test2",3) // doesn't override
  config.getDefault("default1now3",1)
  function allValid() {
    return config.get("test") == 1 && config.get("test2") == 2 && config.get('default1now3') == 3;
  }
  this.do()
    .then(function configValuesInStorage() {
      config.set('default1now3',3); // override
      return true;
    })
    .then(allValid)
    .reloadWindow()
    .then(allValid)
    .checkResults(function getData() { return config.getData() })
    .checkResults(function getSchema() { return config.getSchema() })
    .checkResults(function setSchema() {
      return config.setSchema([
        {name: "A", _default: 'a'},
        {name: "OneIsInt", _default: 1, type: 'integer'}
      ]);
    })
}


function testForm() {
  this.do("ur-form tests")
    .setHash("#ur-form-demo")
    .wait("#id_first_name")
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

konsole.addCommands(testStorage,testConfig,testForm,testTabs)
