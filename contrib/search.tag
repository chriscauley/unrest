uR.ready(function() {
  uR.addRoutes({
    "^/(search)/$": function() { uR.mountElement("ur-search"); },
  });
});
<ur-search>
  <ur-form action={ uR.config.search_url } initial={ initial } schema={ schema } autosubmit="true"
           ajax_success={ ajax_success }></ur-form>

  <div class="search_results rows" name="ajax_target">
    <div onclick={ parent.opts.select } each={ results }>
      <a class="flexy" href={ url }>
        <div class="thumbnail" if={ thumbnail } style="background-image: url({ thumbnail })"></div>
        <div class="details">
          <div class="name">{ name }</div>
        </div>
      </a>
    </div>
  </div>
  var search_tag = this;
  this.schema = [
    { name: "q", placeholder: uR.config.search_placeholder || "Enter search query" },
  ];
  this.initial = { q: uR.getQueryParameter("q") }

  this.ajax_success = function(data,request) {
    search_tag.query = search_tag.root.querySelector("[name=q]").value;
    search_tag.results = data.results;
    window.history.replaceState({},"Search: "+search_tag.query,"?q="+escape(search_tag.query));
    search_tag.update();
  }

  this.on("mount",function() {
    this.needs_search = this.initial.q;
    this.update();
  });
</ur-search>
