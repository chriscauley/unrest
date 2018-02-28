<ur-table>
  <table class={ uR.css.table }>
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
      self.tbody.push([`<a href="#!/admin/${app.name}/">${app.verbose_name}</a>`])
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
    this.app = uR.db.getApp(app_label);
    this.thead = ["Model","Count"];
    this.tbody = this.app._models.map(function(model) {
      return [`<a href="#!/admin/${app_label}/${model.name}/">${model.verbose_name}</a>`,model.objects.count()];
    });
    this.update();
  });
  </script>
</ur-admin-app>

<ur-admin-list>
  <div class={ theme.outer }>
    <div class={ theme.header }>
      <div class={ theme.header_title }>
        { model.verbose_name } Admin
        <a class="{ uR.css.btn.primary } { uR.css.right }"
           href="#!/admin/{app.name}/{model.name}/new/">New { model.verbose_name }</a>
      </div>
    </div>
    <div class={ theme.content }>
      <ur-table></ur-table>
    </div>
  </div>

  <script>
  this.on("mount", function() {
    var app_label = this.opts.matches[1];
    var model_name = this.opts.matches[2];
    this.app = uR.db.getApp(app_label);
    this.model = uR.db.getModel(app_label,model_name);
    this.thead = ["Object name"];
    this.tbody = this.model.objects.all().map(function(obj) {
      return [`<a href="#!/admin/${app_label}/${model_name}/${obj.id}/">${obj.toString()}</a>`]
    });
    this.update();
  })
  </script>
</ur-admin-list>

<ur-admin-edit>
  <div class={ theme.outer }>
    <div class={ theme.header }>
      <div class={ theme.header_title }>Editing: { obj.toString() }</div>
    </div>
    <div class={ theme.content }>
      <ur-form></ur-form>
    </div>
  </div>

  this.on("mount",function() {
    var app_label = this.opts.matches[1];
    var model_name = this.opts.matches[2];
    var obj_id = this.opts.matches[3];
    this.app = uR.db.getApp(app_label);
    this.model = uR.db.getModel(app_label,model_name);
    if (obj_id == "new") { this.obj = new this.model() }
    else { this.obj = this.model.objects.get(obj_id); }
    this.schema = this.obj.getSchema();
    this.update();
  });
</ur-admin-edit>

uR.ready(function() {
  uR.router.add({
    "#!/admin/$": uR.router.routeElement("ur-admin-home"),
    "#!/admin/([^/]+)/$": uR.router.routeElement("ur-admin-app"),
    "#!/admin/([^/]+)/([^/]+)/$": uR.router.routeElement("ur-admin-list"),
    "#!/admin/([^/]+)/([^/]+)/(\\d+|new)/$": uR.router.routeElement("ur-admin-edit"),
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
    return uR.route("#!/"+path+"/");
  }
  uR.admin.start = function() {
    var parent = uR.newElement("div",{id:"ur_root",parent: document.body});
    var admin_button = uR.newElement("a",{
      className: "fa fa-edit open-admin "+uR.config.btn_primary,
      href: "#!/admin/",
      parent: parent,
    });
  }
})()
