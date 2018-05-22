(function() {
  uR.css = {
    modal: {
      outer: "card",
      header: "card-title",
      content: "card-content",
      footer: "card-action",
    },
    default: {
      outer: "card",
      header: "card-title",
      content: "card-content",
      footer: "card-action",
    },
    error: "card red white-text error",
    table: "table table-striped table-hover",
    form: {
      field: "input-field",
      select: 'browser-default',
    },
    btn: {
      default: "btn",
      primary: "btn blue",
      success: "btn green",
      cancel: "btn red",
      warning: "btn yellow",
    },
    alert: {
      success: "alert alert-success card card-content", // bootstrap
    },
    admin: {
      open_icon: 'fa fa-pencil-square-o',
    },
    tabs: {
      root: "default",
    }
  }
  uR._var = {};

  uR.forEach(document.styleSheets, function (ss) {
    uR.forEach(['materialize','spectre','bootstrap'],function(theme) {
      if (!ss.href || ss.href.indexOf(theme) == -1) { return }
      document.body.setAttribute("ur-theme",theme)
      if (theme == "spectre") {
        uR.css.default.content = "card-body";
        uR.css.form.field = "form-group";
        uR.css.form.input = "form-input";
        uR.css.btn = {
          default: "btn",
          primary: "btn btn-primary",
          success: "btn btn-success",
          cancel: "btn btn-error",
          warning: "btn bg-warning",
        };
        uR.css.modal = {
          root: "modal active",
          outer: "modal-container",
          mask: "modal-overlay",
          header: "modal-header",
          content: "modal-body",
          footer: "modal-footer",
          header_title: "modal-title h4",
        }
        uR.css.right = "float-right";
        uR.css.left = "float-left";
        uR.css.row = "columns";
        [1,2,3,4,5,6,7,8,9,10,11,12].map((i) => uR.css['col'+i] = "column col-"+i);
      }
    })
  });
})();
