// https://jsfiddle.net/warpech/8dyx615f/
(function loadURLShim() {
  var airbrake = window.airbrake || {log: function(e) { console.error(e) } };
  try {
    new URL(window.location.href,window.location.origin);
    new URL(window.location.href,undefined);
    return;
  } catch (e) {
    airbrake.log("Reason for using url shim:",e);
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
// ie11 polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}
