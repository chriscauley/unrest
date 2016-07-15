<four-oh-four>
  <h1>Error 404: Page Not Found</h1>
  <div onclick={ next }>{ current }</div>

  <style scoped>
    :scope {
      display: flex;
      align-items: center;
      flex-flow: column;
      height: 100%;
      justify-content: center;
      text-align: center;
    }
    :scope { font-size: 2em; }
  </style>

  this.quotes = uR.config.quotes_404 || [
    "Somethings aren't meant to be questioned.\n Most things actually.",
    "May you find love.\n May you find it wherever it's been hidden.\n May you find who has been hiding it\n and exact revenge upon them.\n As the old song goes: 'Love is all you need to destroy your enemies.' Finer words were never chanted.",
    "Not all who wander are found.",
    "Time is weird. So is space. I hope ours match some day.",
    "When life seems dangerous and unmanageable, just remember that it is, and that you can't survive forever.",
    "If at first you don't succeed, look around you and try to find out who is trying to sabotage you with telepathic interference.\n It is someone you know.",
    "[A webpage's] existence is not impossible but also not very likely.",
    "If you see something say nothing, and drink to forget",
    "I am found! I am found! I am found! Stop looking for me and find yourself!",
  ];
  this.on("update",function() {
    this.current = this.quotes[Math.floor(Math.random()*this.quotes.length)];
    document.title = "Erika";
  })
  next(e) {
    this.update();
  }
</four-oh-four>
