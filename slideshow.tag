<slideshow>
  <div class="scroll-outer">
    <div class="slide-wrap"><yield /></div>
  </div>
  <a onclick={ next } class="arrow next" style="width: { arrow_size }px"></a>
  <a onclick={ prev } class="arrow prev" style="width: { arrow_size }px"></a>

  this.on("mount",function() {
    this.slides = this.root.querySelectorAll("slide");
    this.scroll_outer = this.root.querySelector(".scroll-outer");
    this.slide_wrap = this.root.querySelector(".slide-wrap");

    // copy the first two nodes for wrap around transitions
    this.slide_wrap.appendChild(this.slides[0].cloneNode(true));
    this.slide_wrap.appendChild(this.slides[1].cloneNode(true));
    this.slide_wrap.appendChild(this.slides[2].cloneNode(true));
    this.slides = this.root.querySelectorAll("slide");
    this.max_slide = this.slides.length - 2; // "first" slide
    this.min_slide = 1;

    this.current_slide = this.max_slide-1;
    this.root.setAttribute("data-after-text",this.current_slide);
    this.animation_time = 1000;
    this.animate_proxy = this.animate.bind(this)
    window.addEventListener("resize", uR.debounce(this.update.bind(this)));
    this.update();
  });
  animate() {
    var t = new Date().valueOf()-this.start_time;
    var d = this.animation_time;
    t = Math.min(t/d,1);
    var ratio = Math.min(-t*(t-2),1);
    this.scroll_outer.scrollLeft = this.start_left + this.d_left*ratio;
    this.root.setAttribute("data-before-text",this.scroll_outer.scrollLeft);
    if (ratio != 1) {
      cancelAnimationFrame(this.animation_frame);
      this.animation_frame = requestAnimationFrame(this.animate_proxy);
    }
  }
  this.on("update",function() {
    if (this.root.offsetWidth != this.slide_width+this.bumper*2) {
      // need to remeasure things and stop the animation if size of container is changed.
      this.slide_width = Math.max(this.slides[0].offsetWidth,320);
      this.slide_wrap.style.width = (this.slide_width*this.slides.length)+"px";
      this.bumper = (this.root.offsetWidth-this.slide_width)/2;
      this.slide_wrap.style.marginLeft = this.bumper + "px";
      this.arrow_size = Math.max(50,this.bumper);
      cancelAnimationFrame(this.animation_frame);
      this.scroll_outer.scrollLeft = this.current_slide * this.slide_width;
    }
  })
  scroll() {
    // sets up the animation and fires of initial request animation
    this.start_left = this.scroll_outer.scrollLeft;
    this.start_time = new Date().valueOf();
    this.end_left = this.current_slide * this.slide_width;
    this.d_left = this.end_left - this.start_left;
    cancelAnimationFrame(this.animation_frame);
    this.animation_frame = requestAnimationFrame(this.animate_proxy);
    this.root.setAttribute("data-after-text",this.current_slide);
  }
  next(e) {
    this.current_slide++;
    if (this.current_slide > this.max_slide) {
      // overflow, jump to start instantly
      this.scroll_outer.scrollLeft = this.slide_width;
      this.current_slide = this.min_slide+1;
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
