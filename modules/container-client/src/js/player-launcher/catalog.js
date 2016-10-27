function CatalogDefinition(element, options, errorCallback) {

  var instance;
  var Launcher = require('client-launcher');
  var errorCodes = require('error-codes');
  var launcher = new Launcher(element, options, errorCallback);

  var initOk = launcher.init();

  if (initOk) {

    if (options.itemId) {

      var loadCall = launcher.loadCall('catalog', function(u) {
        return u.replace(':itemId', options.itemId);
      });

      if (!loadCall) {
        return;
      }

      var tabs = [];
      for (var k in options.tabs) {
        if (options.tabs[k]) {
          tabs.push(k);
        }
      }

      var hashOpts = tabs.length > 0 ? {
        hash: '?tabs=' + tabs.join(',')
      } : null;
      var call = $.extend(loadCall, hashOpts);
      instance = launcher.loadInstance(call, {});

    } else {
      errorCallback(errorCodes.NO_ITEM_ID);
    }
  } else {
    errorCallback(errorCodes.INSTANCE_NOT_READY);
  }

  this.remove = function() {
    if (instance) {
      instance.remove();
    }
  };

}

module.exports = CatalogDefinition;