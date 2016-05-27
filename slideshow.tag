<slideshow>
  <div class="scroll-outer">
    <div class="slide-wrap"><yield /></div>
  </div>
  <div if={ opts.controls == "arrows" }>
    <a onclick={ next } class="arrow next" style="width: { arrow_size }px"></a>
    <a onclick={ prev } class="arrow prev" style="width: { arrow_size }px"></a>
  </div>
  <div if={ opts.controls == "slides" } class="controls">
    <a onclick={ scrollTo } class="scroll-to { current: i == parent.current_slide }" each={ i in _slides }></a>
  </div>

  var self = this;
  this.on("mount",function() {
    this.slides = this._slides = this.root.querySelectorAll("slide");
    this.scroll_outer = this.root.querySelector(".scroll-outer");
    this.slide_wrap = this.root.querySelector(".slide-wrap");

    this.max_slide = this.slides.length;
    this.min_slide = 0;

    this.current_slide = this.min_slide;
    this.root.setAttribute("data-after-text",this.current_slide);
    this.animation_time = 1000;
    this.animate_proxy = this.animate;
    window.addEventListener("resize", uR.debounce(this.update.bind(this)),1000);
    this.opts.visible = this.opts.visible || "max";
    this.root.style.display = "block";
    this.update();
  });
  animate() {
    var t = new Date().valueOf()-self.start_time;
    var d = self.animation_time;
    t = Math.min(t/d,1);
    var ratio = Math.min(-t*(t-2),1);
    self.scroll_outer.scrollLeft = self.start_left + self.d_left*ratio;
    self.root.setAttribute("data-before-text",self.scroll_outer.scrollLeft);
    if (ratio != 1) {
      cancelAnimationFrame(self.animation_frame);
      self.animation_frame = requestAnimationFrame(self.animate_proxy);
    }
  }
  this.on("update",function() {
    // need to remeasure things and stop the animation if size of container is changed.
    this.slide_width = 410;

    // on mobile we're canceling slide show in favor of a single shot
    if (document.body.scrollWidth < 2*this.slide_width) { return }
    if (this.opts.visible == "max") {
      this.visible = Math.floor(this.root.offsetWidth / this.slide_width);
    } else { this.visible = this.opts.visible; }
    if (this.scroll_outer.offsetWidth != this.visible*this.slide_width) {
      this.max_slide = Math.floor(this.slides.length/this.visible);
      this._slides = [];
      var i = 0;
      while (i<this.max_slide) { this._slides.push(i); i++; }
      this.scroll_outer.style.width = (this.visible*this.slide_width)+"px";
      this.slide_wrap.style.width = (this.slide_width*this.slides.length)+"px";
      cancelAnimationFrame(this.animation_frame);
      this.scroll_outer.scrollLeft = this.current_slide * this.slide_width;
    }
  })
  scrollTo(e) {
    this.current_slide = e.item.i;
    this.scroll();
  }
  scroll() {
    // sets up the animation and fires of initial request animation
    this.start_left = this.scroll_outer.scrollLeft;
    this.start_time = new Date().valueOf();
    this.end_left = this.current_slide * this.slide_width * this.visible;
    this.d_left = this.end_left - this.start_left;
    this.animation_frame = requestAnimationFrame(this.animate_proxy,17);
    this.root.setAttribute("data-after-text",this.current_slide);
  }
  next(e) {
    this.current_slide++;
    if (this.current_slide > this.max_slide) {
      // overflow, jump to start instantly
      this.scroll_outer.scrollLeft = this.slide_width;
      this.current_slide = this.min_slide;
    }
    this.scroll();
  }
  prev(e) {
    this.current_slide--;
    if (this.current_slide < this.min_slide) {
      // going negative, jump to end instantly
      this.current_slide = this.max_slide-1;
      this.scroll_outer.scrollLeft = this.slide_width * (this.current_slide+1);
    }
    this.scroll();
  }
</slideshow>
