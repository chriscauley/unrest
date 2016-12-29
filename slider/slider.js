(function() {
  class Slider {
    constructor(selector,options) {
      options = options || {};
      this.root = document.querySelector(selector);
      if (!this.root) { return; }
      if (!this.root.querySelector(".slides > li")) {
        this.root.parentElement.removeChild(this.root);
        return
      }

      this.slides = this.root.querySelectorAll(".slides > li");
      if (this.slides.length == 1) {
        this.slides[0].classList.add("active");
        return;
      }

      this.indicators = [];
      if (this.root.dataset.indicators == "thumbs") {
        this.root.classList.add("thumbs");
        for (var i=0;i<2;i++) {
          var name = i?"next":"prev";
          var e = document.createElement("a");
          e.classList.add(name);
          e.addEventListener("click",this[name].bind(this))
          this.root.appendChild(e);
        }
      }

      var ul = document.createElement("ul");
      ul.addEventListener("click",this.click.bind(this));
      ul.className = "indicators";
      for (var i=0;i<this.slides.length;i++) {
        var li = document.createElement("li")
        li.className = "indicator-item";
        ul.appendChild(li);
        this.indicators.push(li);
        if (this.root.dataset.indicators == "thumbs") {
          var img = this.slides[i].querySelector("img")
          li.style.backgroundImage = img?"url("+img.src+")":this.slides[i].style.backgroundImage;
        }
      }
      this.root.appendChild(ul);
      this.i = 0;
      this.tick();
      this.interval = setInterval(this.next.bind(this), 4000);
      if (this.root.dataset.indicators == "thumbs") {
        this.resize();
      }
    }
    resize(e) {
      // currently only used for "thumbs" mode, hides and shows the next/prev icons
      this.width = this.root.clientWidth
      this.thumb_width = this.indicators[0].clientWidth;
      if (this.indicators.length*this.thumb_width <= this.width) {
        this.root.querySelector(".next").style.display = 'none';
        this.root.querySelector(".prev").style.display = 'none';
      } else {
        this.root.querySelector(".next").style.display = 'block';
        this.root.querySelector(".next").style.display = 'block';
      }
    }
    click(e) {
      clearInterval(this.interval);
      this.i = this.indicators.indexOf(e.target);
      this.tick();
    }
    tick() {
      if (this.i == this.slides.length) { this.i = 0; }
      if (this.i <0) { this.i = this.slides.length-1; }
      uR.forEach(this.root.querySelectorAll("li.active"),function(slide) { slide.classList.remove('active') });
      this.slides[this.i].classList.add("active");
      this.indicators[this.i].classList.add("active");
    }
    next(e) {
      if (e) { clearInterval(this.interval); }
      this.i++;
      this.tick();
    }
    prev(e) {
      if (e) { clearInterval(this.interval); }
      this.i--;
      this.tick();
    }
  }
  uR.Slider = Slider;
})();

uR.ready(function() {
  new uR.Slider(".slider");
});
