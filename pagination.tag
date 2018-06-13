<ur-pagination>
  <div class={uR.css.row} each={ result,ri in results }>
    <div class="{uR.css.col1}" if={ result.url }>
      <a href={ result.url } class="{ uR.icon('link') }"></a>
    </div>
    <div class={uR.css.col4} each={ field,fi in result.fields }>
      <i class={uR.icon(icon)}></i>
      { field.text }
    </div>
    <div class="{uR.css.col1}" if={ result.delete }>
      <a onclick={ result.delete } class="pointer { uR.icon('trash') }"></a>
    </div>
  </div>

  this.on("before-mount",function() {
    this.results = this.opts.results || []; // || (uR.pagination && uR.pagination.results) || [];
    this.results.map((result) =>{
      for (var fi=0;fi<result.fields.length;fi++) {
        var field = result.fields[fi];
        if (typeof field == "string") {
          field = { text: field }
        }
        result.fields[fi] = field;
      }
    });
  });
</ur-pagination>
