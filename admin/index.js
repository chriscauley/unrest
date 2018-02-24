<ur-table>
  <table class={ uR.theme.table }>
    <thead></thead>
    <tbody></tbody>
    <tfoot></tfoot>
  </table>

  this.on("mount",function() {
    var self = this;
    ["thead","tbody","tfoot"].map(function(section) {
      var t_element = self.root.querySelector(section);
      var rows = self.opts[section] || self.parent[section];
      if (!rows) { return }
      if (!Array.isArray(rows[0])) { rows = [rows]; } // rows should be an array of arrays
      rows && rows.map(function(row) {
        var tr = document.createElement("tr");
        row.map(function(column) {
          if (typeof column == "string" || typeof column == 'number') { column = { innerHTML: column +"" } }
          column.parent = tr;
          uR.newElement("td",column);
        })
        t_element.appendChild(tr);
      });
    });
  });
</ur-table>

<ur-admin-home>
  <div class={ theme.outer }>
    <div class={ theme.header }>
      <div class={ theme.header_title }>Admin Home</div>
    </div>
    <div class={ theme.content }>
      <ur-table></ur-table>
    </div>
  </div>

  <script>
  this.on("mount",function() {
    this.thead = ["App Label"];
    this.tbody = [];
    var self = this;
    uR.db.apps.map(function(app) {
      self.tbody.push([`<a href="#/admin/${app.name}/">${app.verbose_name}</a>`])
    })
  });
  </script>
</ur-admin-home>

<ur-admin-app>
  <div class={ theme.outer }>
    <div class={ theme.header }>
      <div class={ theme.header_title }>{ app.verbose_name } Admin</div>
    </div>
    <div class={ theme.content }>
      <ur-table></ur-table>
    </div>
  </div>
  
  <script>
  this.on("mount",function() {
    var app_label = this.opts.matches[1];
    this.app = uR.db[app_label]
    if (!this.app) { throw uR.NOT_IMPLEMENTED("App not found") }
    this.thead = ["Model","Count"];
    this.tbody = this.app._models.map(function(model) {
      return [`<a href="#/admin/${app_label}/${model.name}/">${model.verbose_name}</a>`,model.objects.count()];
    });
    this.update();
  });
  </script>
</ur-admin-app>

<ur-admin>
  <div class={ theme.outer }>
    <div class={theme.content}>
      <table>
        <tr each={ model in app.admin_models }>
          <td><a onclick={ model.edit }>{ model.name }</a></td>
        </tr>
      </table>
    </div>
  </div>

  this.on("mount",function() {
    this.app = this.opts;
    this.app.admin_models = this.app._models.map(function(model) {
      return {
        name: model.name,
        model: model,
        edit: function () { uR.admin.route(model.name) },
      }
    });
    this.update();
  });

</ur-admin>

uR.ready(function() {
  uR.addRoutes({
    "#/admin/$": uR.router.routeElement("ur-admin-home"),
    "#/admin/([^/]+)/$": uR.router.routeElement("ur-admin-app"),
    "#/admin/([^/]+)/([^/]+)/$": uR.router.routeElement("ur-admin-model"),
    "#/admin/([^/]+)/([^/]+)/(\\d+)/$": uR.router.routeElement("ur-admin-model-detail"),
  })
});

(function() {
  uR.admin = {URL_PREFIX: "admin"};
  uR.admin.open = function open(app_label,model) {
    var app = uR.db[app_label];
    uR.alertElement("ur-admin",app);
  }
  uR.admin.route = function route() {
    var path = [uR.admin.URL_PREFIX].concat([].slice.call(arguments)).join("/");
    return uR.route("#/"+path+"/");
  }
})()
