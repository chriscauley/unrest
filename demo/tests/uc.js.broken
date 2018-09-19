u$.konsole = {
  toggle: "konsole .toggle-konsole",
}

function testKonsole() {
  this.do("konsole snapshot")
    .then(pass => { konsole.root.classList.remove("open"); pass() })
    .checkResults("konsole")
    .then(pass => { konsole.root.classList.add("open"); pass() })
    .checkResults("konsole")
}

konsole.addCommands(testKonsole)
