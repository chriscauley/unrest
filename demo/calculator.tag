<calculator>
  <div class="display bg-secondary">
  <div class="ans">{ ans }</div>
    <div class="input">{ input }</div>
    <div class="output" if={ output !== undefined } title={ output }>{ display_output }</div>
  </div>
  <div class="buttons">
    <div each={ group,i in button_groups } class={ group.className }>
      <div class="button-wrap" each={ button,i in group.buttons }>
        <button class="btn-lg { button.className }" onclick={ click } data-key={ button.key }>{ button.text }</button>
      </div>
    </div>
  </div>

<script>
this.on("before-mount",function() {
  this.debug = true;
  this.current_command = [];
  this.old_commands = [];
  this.old_outputs = [];
  this.button_groups = [];
  this.addButtonGroup({
    name: "numbers",
    buttons: "7894561230.C",
  });
  this.addButtonGroup({
    name: "arithmatic",
    buttons: "/*-+",
    btn_class: uR.css.btn.primary,
  })
  this.replaces = { // eg Pressing * then /, the * is dropped
    "*": ".*/+-",
    "/": ".*/+-",
    "+": ".*/+-",
    "-": ".+-",
    ".": ".*/+-",
  }
  this.concatenation_keys = "0123456789+-*/."; // keys that can be added to a string for eval
});
addButtonGroup(opts) {
  uR.defaults(opts,{
    name: uR.REQUIRED,
    buttons: uR.REQUIRED,
    btn_class: uR.css.btn.default,
  })
  var out = {
    className: `button_group ${uR.slugify(opts.name)}`,
    buttons: [],
  };
  for (var i=0;i<opts.buttons.length;i++) {
    var button = opts.buttons[i];
    if (typeof button == "string") { button = { key: button }; }
    uR.defaults(button,{
      text: button.key,
      className: opts.btn_class,
    });
    out.buttons.push(button);
  }
  this.button_groups.push(out);
}
click(e) {
  var key = e.item.button.key;
  if (e.item.button.key == "C") {
    this.current_command = []
  } else {
    for (var i=0;i<2;i++) {
      var last = this.current_command[this.current_command.length-1];
      if (last && this.replaces[key] && this.replaces[key].indexOf(last) != -1) {
        this.current_command.pop();
      }
    }
    if (this.concatenation_keys.indexOf(key) != -1) { this.current_command.push(key); }
  }
  this.input = this.current_command.join("");
  if ("1234567890".indexOf(key) == -1) { return }
  try {
    this.output = eval(this.input.replace("ans",this.current_command.ans));
  } catch (e) { this.debug && console.warn(e); }
  // used to have an "=", but it was poorly implement so I replaced it with "C"
  /*if (key == "=" && this.input != this.output) {
    this.current_command = ['ans'];
    this.current_command.ans = this.output;
    this.ans = this.output;
  }*/
  this.display_output = this.output
   if (this.output.toString().length>5) {
    this.display_output = this.output.toExponential(3)
  }
}
</script>
<style>
:scope {
  width: 266px;
  display: block;
}
:scope .display {
  display: flex;
  flex-wrap: wrap;
  line-height: 1em;
  height: 3em;
  padding: 5px 20px;
  justify-content: space-between;
}
:scope .display .ans {
  flex-basis: 100%;
  font-size: 0.7em;
  font-style: italic;
  height: 10px;
  line-height: 10px;
}
:scope .display .ans:before { content: "ans=" }
:scope .display .ans:empty:before { content: ""; }
:scope .display .output {
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100px;
}
:scope .display .output:before { content: " = "; }
:scope .buttons { display: flex; }
:scope .button_group {
  display: flex;
  flex-wrap: wrap;
}
:scope .button_group .button-wrap {
  padding: 5px;
  width: 100%;
}
:scope .button_group button {
  width: 100%;
}
:scope .button_group.numbers .button-wrap {
  flex-basis: 33%;
}
:scope .button_group.numbers { width: 200px }
:scope .button_group.arithmatic { width: 66px; }

</style>

</calculator>
