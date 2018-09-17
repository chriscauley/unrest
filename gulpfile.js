var ezGulp = require("./ez-gulp");

var PROJECT_NAME = "unrest";

var JS_FILES = {
  vendor: ["src/vendor/*.js"],
  unrest: [
    "src/js/index.js",
    "src/js/*.js",
    "src/js/*.tag",
    "src/js/form/*js",
    "src/js/form/*.tag",
    "src/js/db/*.js",
    "src/js/db/fields/*.js",
    "contrib/nav.tag",
  ],
  canvas: [ "canvas/index.js", ],
  controller: [ "contrib/controller.js" ],
  admin: [ "contrib/admin/index.js" ],
  lunchtime: [ "lunchtime/lunchtime.js", ],

  // older files I may use again someday, not included in unrest_full
  simplemde: ["simplemde/simplemde.tag"],
  'token-input': [
    "token-input/zepto.js", // #!TODO: remove zepto dependency
    "token-input/zepto-extra.js",
    "token-input/data.js",
    "token-input/jquery.tokeninput.js",
    "token-input/token-input.tag"
  ],

}

JS_FILES.unrest_full = [];

for (var key of ['unrest','canvas','controller','admin','lunchtime']){
  JS_FILES.unrest_full = JS_FILES.unrest_full.concat(JS_FILES[key])
}

LESS_FILES = {
  unrest: ["less/base.less"],
  admin: ["contrib/admin/base.less"],

  // older files I may use again someday
  token: ["token-input/token-input.less"],
}

LESS_FILES.unrest_full = LESS_FILES.unrest.concat(LESS_FILES.admin);

var STATIC_FILES = [
  'lib',
  'demo/',
  'lunchtime',
  'favicon.ico',
]

ezGulp({
  js: JS_FILES,
  less: LESS_FILES,
  static: STATIC_FILES,
  DEST: ".dist/"
})