function CatalogDefinition(element, options, errorCallback) {

  var Launcher = require('new-client-launcher');
  var errors = require('errors');
  var launcher = new Launcher(element, options, errorCallback);

  var initOk = launcher.init();

  if(initOk){

    if (options.itemId) {
      
      var loadCall = launcher.loadCall('catalog', function(u){
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

      var hashOpts = tabs.length > 0 ? { hash : '?tabs='+tabs.join(',') } : null;
      var call = $.extend(loadCall, hashOpts);
      var instance = launcher.loadInstance(call, {});

    } else {
      errorCallback(errors.NO_ITEM_ID);
    }

  } else {
    errorCallback(errors.INSTANCE_NOT_READY);
  } 
}

module.exports = CatalogDefinition;
