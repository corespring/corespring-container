function ComponentEditor(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var instance;
  
  function createItem(componentType, callback){

    var call = launcher.loadCall('itemEditor.singleComponent.create');

    if (!call) {
      return;
    }

    callback = callback || function(){};

    function onSuccess(result){

      if(options.onItemCreated){
        options.onItemCreated(result.itemId);
      }

      callback(null, result);
    }

    function onError(xhrErr){
      var msg = (xhrErr.responseJSON && xhrErr.responseJSON.error) ?
        xhrErr.responseJSON.error :
       'Failed to create item.';

      callback(msg);
    }

    $.ajax({
      type: call.method,
      url: launcher.prepareUrl(call.url),
      contentType: 'application/json',
      data: JSON.stringify({componentType: componentType}),
      success: onSuccess,
      error: onError.bind(this),
      dataType: 'json'
    });
  }

  function loadItem(itemId, options) {

    if (!itemId) {
      throw new Error('invalid itemId');
    }

    var callKey = 'itemEditor.singleComponent.load';

    var call = launcher.loadCall(callKey, function(u){
      return u.replace(':itemId', itemId);
    });

    if (!call) {
      errorCallback(errorCodes.CANT_FIND_URL('cant find a url for key: ' + callKey));
      return;
    }

    var initialData = {};

    function onReady(instance){
    }

    instance = launcher.loadInstance(call, options.queryParams, {}, onReady);
  }

  var ok = launcher.init();

  if(ok){

    if (options.itemId) {
      loadItem(options.itemId, options);
    } else {
      createItem(options.componentType, function(err, result){
        if(err){
          errorCallback(errorCodes.CREATE_ITEM_FAILED(err));
        } else {
          options.itemId = result.itemId;
          loadItem(options.itemId, options);
        }
      });
    }

  } else {
    return;
  }


  this.save = function(done){
    if(instance){
      instance.send('save', done);
    }
  };
  
  this.remove = function() {
    if(instance){
      instance.remove();
    }
  };
}

module.exports = ComponentEditor;
