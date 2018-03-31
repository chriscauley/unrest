<calculator>
  <div class="display bg-secondary">
    <div class="input">{ current_command }</div>
    <div class="output" if={ output } title={ output }>{ output }</div>
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
  this.current_command = "";
  this.button_groups = [];
  this.addButtonGroup({
    name: "numbers",
    buttons: "7894561230.=",
  });
  this.addButtonGroup({
    name: "arithmatic",
    buttons: "/*-+",
    btn_class: uR.css.btn.primary,
  })
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
  this.current_command += e.item.button.key;
  try {
    this.output = eval(this.current_command);
  } catch (e) { this.debug && console.warn(e); }
}
</script>
<style>
:scope {
  width: 266px;
  display: block;
}
:scope .display {
  display: flex;
  line-height: 1em;
  height: 25px;
  padding: 5px;
  justify-content: space-between;
}
:scope .display .output {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 66px;
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
