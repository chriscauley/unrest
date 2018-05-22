<ur-pagination>
  <div class={uR.css.row} each={ results }>
    <div class={uR.css.col1}>
      <a href={ url } class="fa fa-link" if={ url }></a>
    </div>
    <div class={uR.css.col4} each={ field in fields }>{ field }</div>
  </div>

  this.on("before-mount",function() {
    this.results = this.opts.results || (uR.pagination && uR.pagination.results) || [];
  });
</ur-pagination>
