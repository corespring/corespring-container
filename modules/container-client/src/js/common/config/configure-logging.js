(function(root) {

  angular.module('corespring-common.config')
    .value('configureLogging', configureLogging) //for testing
    .config(['$provide', configureLogging]);

  function configureLogging($provide) {

    function getParams() {
      var nameValueStrings = document.location.search.replace('?', '').split('&');

      function toNameValue(acc, s) {
        var arr = s.split('=');
        acc[arr[0]] = arr[1];
        return acc;
      }

      return _.reduce(nameValueStrings, toNameValue, {});
    }

    var params = getParams();
    var loggers = {
      empty: function ($delegate) {
        var out = {
          log: function () {
          },
          debug: function () {
          },
          info: function () {
          }
        };
        out.error = $delegate.error;
        out.warn = $delegate.warn;
        return out;
      },
      passThrough: function ($delegate) {
        return $delegate;
      },
      filtering: function (category) {
        return function ($delegate) {
          function filter(fnName) {
            return function () {
              var args = Array.prototype.slice.call(arguments);
              var firstArg = args[0];
              if (new RegExp('.*' + category + '.*').test(firstArg)) {
                $delegate[fnName].apply(null, args);
              }
            };
          }

          var out = {
            log: filter('log'),
            debug: filter('debug'),
            info: filter('info')
          };
          out.error = $delegate.error;
          out.warn = $delegate.warn;
          return out;
        };
      }
    };

    function decorateLogFactory($delegate){
      return {
        getLogger: function (n) {
          if (params.logCategory) {
            var matches = new RegExp('.*' + params.logCategory + '.*').test(n);
            if (matches) {
              return $delegate.getLogger(n);
            } else {
              return loggers.empty($delegate.getLogger(n));
            }
          } else if (params.loggingEnabled === 'true') {
            return $delegate.getLogger(n);
          } else {
            return loggers.empty($delegate.getLogger(n));
          }
        }
      };
    }

    function decorateLog($delegate, $sniffer) {
      var logFn = (function () {
        if (params.logCategory) {
          return loggers.filtering(params.logCategory);
        } else if (params.loggingEnabled === 'true') {
          return loggers.passThrough;
        } else {
          return loggers.empty;
        }
      })();
      return logFn($delegate);
    }

    $provide.decorator('LogFactory', decorateLogFactory);
    $provide.decorator('$log', decorateLog);
  }
})(this);
