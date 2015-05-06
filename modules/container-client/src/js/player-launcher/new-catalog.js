function CatalogDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var errors = require('errors');
  var launcher = new Launcher(element, options, errorCallback);

  function loadItem(itemId, options) {
    var loadCall = launcher.loadCall("catalog");
    if (!loadCall) {
      return;
    }

    var url = (loadCall.url).replace(":itemId", itemId);
    var tabs = [];
    for (var k in options.tabs) {
      if (options.tabs[k]) {
        tabs.push(k);
      }
    }

    var hashOpts = tabs.length > 0 ? { hash : '?tabs='+tabs.join(',') } : null;
    launcher.mkInstance(url, hashOpts);
  }

  launcher.loadClient = function(){
    if (options.itemId) {
      loadItem(options.itemId, options);
    } else {
      errorCallback(errors.NO_ITEM_ID);
    }
  };

  launcher.init();
}

module.exports = CatalogDefinition;
