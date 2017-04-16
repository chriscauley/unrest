uR.ready(function() {
  uR.addRoutes({
    "^/(search)/$": function() { uR.mountElement("ur-search"); },
  });
});
<ur-search>
  <ur-form action={ uR.config.search_url } initial={ initial } schema={ schema } autosubmit="true"
           ajax_success={ ajax_success }></ur-form>

  <div class="search_results rows" name="ajax_target">
    <div onclick={ parent.opts.select } each={ search_results } class="fourth btn btn-primary">
      <img if={ thumbnail } riot-src="{ thumbnail }" />
      <div class="name">{ name }</div>
    </div>
  </div>
  this.schema = [
    { name: "q", placeholder: uR.config.search_placeholder || "Enter search query" },
  ];
  this.initial = { q: uR.getQueryParameter("q") }

  this.ajax_success = function(data,request) {
    this.query = this.root.querySelector("[name=q]").value;
    this.results = data.results;
    this.update();
    window.history.replaceState({},"Search: "+this.query,"?q="+escape(this.query));
  }

  this.on("mount",function() {
    this.needs_search = this.initial.q;
    this.update();
  });
</ur-search>
