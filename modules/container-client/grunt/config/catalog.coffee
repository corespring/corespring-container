exports.src = [
  'js/corespring/core-library.js',
  'js/corespring/server/init-core-library.js',
  'js/catalog/**/*.js',
  'js/render/services/**/*.js',
  'js/render/directives/**/*.js',
  'js/render/controllers/**/*.js',
  'js/common/services/message-bridge.js',
  'bower_components/angular-route/angular-route.min.js',
  'bower_components/angular-ui-router/release/angular-ui-router.min.js'
]

exports.dest = 'prod-catalog.js'
