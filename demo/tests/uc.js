u$.konsole = {
  toggle: "konsole .toggle-konsole",
}

function testKonsole() {
  this.do("konsole snapshot")
    .then(pass => { console.log(konsole.root) || konsole.root.classList.remove("open"); pass() })
    .checkResults("konsole")
    .then(pass => { konsole.root.classList.add("open"); pass() })
    .checkResults("konsole")
    .done("konsole opens and closes as planned")
}

konsole.addCommands(testKonsole)
