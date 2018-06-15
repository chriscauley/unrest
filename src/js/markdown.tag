<markdown><yield/>
  this.on("mount",function() {
    this.content = this.content ||this.opts.content;
    if (this.root.innerHTML) {
      function htmlDecode(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
      }
      this.content = htmlDecode(this.root.innerHTML);
    }
    if (!this.opts.allow_pre) {
      this.content = this.content.replace(/^<pre>/i,"");
      this.content = this.content.replace(/<\/pre>$/i,"");
    }
    if (this.opts.url && !this.content) {
      uR.ajax({
        url: this.opts.url,
        success: (function(data,request) {
          this.opts.content = request.responseText;
          this.mount();
        }).bind(this)
      });
      return
    }
    if (!markdown) {
      this.root.innerHTML = 'No markdown library, we recommend https://cdnjs.cloudflare.com/ajax/libs/markdown.js/0.5.0/markdown.min.js'
    } else {
      this.root.innerHTML = markdown.toHTML(this.content.replace("&amp;","&"));
    }
  });
  setContent(content) {
    this.content = content;
    this.mount();
  }
</markdown>
