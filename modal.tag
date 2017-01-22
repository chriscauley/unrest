// depracated, don't use!

<modal>
  <div class="mask" onclick={ cancel }></div>
  <div class="inner">
    <a onclick={ cancel } class="cancel">X</a>
    <yield/>
    <center>
      <button class="{ uR.config.btn_cancel }" onclick={ cancel } if={ cancel_text }>{ cancel_text }</button>
      <button class="{ uR.config.btn_success }" onclick={ success } if={ success_text }>{ success_text }</button>
    </center>
  </div>

  <style scoped>
  :scope {
    display: block;
    position: fixed;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    justify-content: center;
    min-height: 500px;
    overflow: hidden;
    z-index: 10000;
  }
  :scope.absolute { position: absolute; }
  @media (max-width: 480px) { /* we'll need all the space we can get in mobile */
    :scope.absolute { position: fixed; }
  }
  :scope, .mask {
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
  }
  .cancel {
    background: black;
    color: white;
    cursor: pointer;
    display: block;
    height: 26px;
    line-height: 26px;
    position: absolute;
    right: 0;
    text-align: center;
    text-decoration: none;
    top: 0;
    width: 26px;
    z-index: 1;
  }
  .mask {
    background: rgba(0,0,0,0.3);
    position: absolute;
    z-index: 1;
  }
  > .inner {
    align-self: center;
    display: inline-block;
    background: white;
    max-height: 100%;
    max-width: 100%;
    overflow: auto;
    padding: 25px 25px 30px;
    position: relative;
    z-index: 2;
  }
  </style>

  var self = this;
  if (window.HOMER) { self.mixin(HOMER.StaticMixin); }
  cancel(e) {
    (self.opts.cancel || function(){})(e);
    // #!TODO This is necessary because unmounting a modal with a parent makes the modal no longer update if it is remounted. One possible solution would be `!self.parent && self.unmount()` instead (?)
    !self.opts.stay_mounted && self.unmount();
  }
  success(e) {
    (self.opts.success || function(){})();
    !self.opts.stay_mounted && self.unmount();
  }
  this.on("update",function() {
    this.modal_class = this.opts.modal_class || "";
    this.cancel_text = this.opts.cancel_text;
    this.success_text = this.opts.success_text;
    if (this.parent && this.parent.opts && this.parent.opts.modal_class) {
      this.modal_class += " "+ this.parent.opts.modal_class;
    }
    this.root.className = this.modal_class;
  });
</modal>
