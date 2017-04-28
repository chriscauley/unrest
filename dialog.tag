(function() { 
  var DialogMixin = {
    init: function() {
      if (this.opts.ur_modal){
        this.theme = this.opts.theme || uR.theme.modal;
        var e = document.createElement('div');
        this.cancel = this.cancel || this.opts.cancel || function() { this.unmount() };
        e.addEventListener("click",function() { this.cancel() }.bind(this));
        e.setAttribute("ur-mask",true);
        if (this.root.childNodes.length) {
          this.root.insertBefore(e,this.root.childNodes[0])
        } else {
          this.root.appendChild(e);
        }
      } else {
        this.theme = this.opts.theme || uR.theme.default;
      }
    }
  }

  riot.mixin(DialogMixin);

  uR.alert = function(text,data) {
    data = data || {};
    data.close_text = data.close_text || "Close";
    data.innerHTML = "<center style='margin-bottom: 1em;'>"+text+"</center>";
    uR.alertElement("ur-modal",data);
  } 
  uR.confirm = function(text,data) {
    if (typeof data == 'function') { data = { success: data } }
    data = data || {};
    data.buttons = data.buttons || [];
    data.close_text = data.close_text || "No";
    data.buttons.push({
      onclick: data.success,
      className: uR.config.btn_success,
      text: data.success_text || "Yes"
    });
    data.innerHTML = "<center style='margin-bottom: 1em;'>"+text+"</center>";
    uR.alert(text,data);
  }
})();

<ur-modal>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <div class="inner-content"></div>
      <yield />
      <center>
        <button onclick={ close } class={ uR.config.btn_primary }>{ close_text }</button>
        <button each={ opts.buttons } class={ className } onclick={ _onclick }>{ text }</button>
      </center>
    </div>
  </div>

  var self = this;
  this.close_text = this.opts.close_text || "Close";
  this.on("mount",function() {
    uR.forEach(this.opts.buttons || [],function(b) {
      b._onclick = function(e) { b.onclick(e); self.unmount() }
    });
    self.update();
  });
  close(e) {
    this.opts.cancel && this.opts.cancel();
    this.unmount();
  }
</ur-modal>
