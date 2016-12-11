(function() { 
  var DialogMixin = {
    init: function() {
      if (this.opts.ur_modal){
        this.theme = this.opts.theme || uR.theme.modal;
        var e = document.createElement('div');
        this.cancel = this.cancel || function() { this.unmount() };
        e.addEventListener("click",this.cancel.bind(this));
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
})();

<ur-modal>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <yield />
      <center>
        <button onclick={ close } class={ uR.config.btn_primary }>{ close_text }</button>
      </center>
    </div>
  </div>

  this.close_text = this.opts.close_text || "Close";

  close(e) {
    this.unmount();
  }
</ur-modal>
