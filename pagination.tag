<ur-pagination>
  <div class="flex-row" each={ uR.pagination && uR.pagination.results }>
    <div class="col1">
      <a href={ url } class="fa fa-link" if={ url }></a>
      <a href={ ur_admin } class={ uR.icon.admin } if={ ur_admin }></a>
    </div>
    <div class="col4" each={ field in fields }>{ field }</div>
  </div>

  this.on("update",function() {
    uR.pagination && uR.forEach(uR.pagination.results,function(result) {
      result.ur_admin = uR.config.form_prefix.replace("^#?","")+"/"+uR.form.current_form+"/"+result.id+"/";
    });
  });
</ur-pagination>
