
###
If the path contains (.min)
This means that:
 - for prod builds - use the pre-minified file
 - for dev builds - use the non minified file
###

exports.js = [
  'bower_components/spin.js/spin.js',
  'bower_components/es5-shim/es5-shim(.min).js',
  'bower_components/console-polyfill/index.js',
  'bower_components/jquery/dist/jquery(.min).js',
  'bower_components/jquery-ui/jquery-ui(.min).js',
  'bower_components/angular/angular(.min).js',
  'bower_components/angular-animate/angular-animate(.min).js',
  'bower_components/lodash/dist/lodash(.min).js',
  'bower_components/angular-ui-sortable/sortable(.min).js',
  'bower_components/mathjs/dist/math(.min).js',
  'bower_components/saxjs/lib/sax.js',
  'bower_components/bootstrap/dist/js/bootstrap(.min).js',
  'bower_components/msgr.js/dist/msgr(.min).js'
]

exports.css = [
  'bower_components/jquery-ui/themes/base/resizable.css',
]
