// https://jsfiddle.net/warpech/8dyx615f/
(function loadURLShim() {
  try {
    new URL(window.location.href);
    return;
  } catch (e) {
    airbrake.log("Reason for using url shim:");
    airbrake.log(e);
  }
  window.URL = function shimURL(url, base) {
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentWindow.document.write('<base href="' + base + '"><a href="' + url + '"></a>');
    var a = iframe.contentWindow.document.querySelector('a');
    document.body.removeChild(iframe);
    return a;
  }
})();
