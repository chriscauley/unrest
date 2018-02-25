uR.ready(function() {
  uR.updateSearchResults = uR.updateSearchResults || function(r) { return r; }
  uR.router.add({
    "^/(search)/$": function() { uR.mountElement("ur-search"); },
  });
});
<ur-search>
  <ur-form action={ uR.config.search_url } initial={ initial } schema={ schema } autosubmit="first"
           ajax_success={ ajax_success }></ur-form>

  <div class="search_results rows" name="ajax_target">
    <div each={ r in results } if={ !uR.config.search_results_tag }>
      <a class="flexy" href={ r.url }>
        <div class="thumbnail" if={ r.thumbnail } style="background-image: url({ r.thumbnail })"></div>
        <div class="details">
          <div each={ key in parent.keys } class={ key }>{ r[key] }</div>
        </div>
      </a>
    </div>
  </div>
  var self = this;
  this.schema = [
    { name: "q", placeholder: uR.config.search_placeholder || "Enter search query" },
  ];
  this.initial = { q: uR.getQueryParameter("q") }

  this.ajax_success = function(data,request) {
    self.query = self.root.querySelector("[name=q]").value;
    window.history.replaceState({},"Search: "+self.query,"?q="+escape(self.query));
    self.results = uR.updateSearchResults(data.results);
    if (uR.config.search_results_tag) {
      var target = self.ajax_target;
      while (target.hasChildNodes()) { target.removeChild(target.lastChild); }
      var t = document.createElement(uR.config.search_results_tag);
      target.appendChild(t);
      riot.mount(t,{ items: data.results });
    } else {
      self.update();
    }
  }

  this.on("mount",function() {
    this.needs_search = this.initial.q;
    this.update();
    this.keys = uR.config.search_display_fields || ["name"];
  });
</ur-search>
