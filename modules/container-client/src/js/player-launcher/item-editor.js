function EditorDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback);
  var errorCodes = require('error-codes');

  function createItem(callback){

    var call = launcher.loadCall('createItem');

    if (!call) {
      return;
    }

    launcher.log('create item');

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
      data: {},
      success: onSuccess,
      error: onError.bind(this),
      dataType: 'json'
    });
  }

  function loadItem(itemId, options) {

    if (!itemId) {
      throw new Error('invalid itemId');
    }

    var call = launcher.loadCall(options.devEditor ? 'devEditor' : 'editor', function(u){
      return u.replace(':itemId', itemId);
    });

    if (!call) {
      errorCallback(errorCodes.NO_DRAFT_ID);
      return;
    }

    var tab = options.selectedTab;

    if ('profile' === tab) {
      call.hash = '/profile';
    }

    if ('supporting-materials' === tab) {
      call.hash = '/supporting-materials/0';
    }

    var initialData = {profileConfig: options.profileConfig};

    function onReady(instance){
      if(options.devEditor){
        instance.css('height', '100%');
      }

      if(options.onItemLoaded){
        options.onItemLoaded(options.itemId);
      }
    }

    var instance = launcher.loadInstance(call, options.queryParams, initialData, onReady);
  }

  var ok = launcher.init();

  if(ok){

    if (options.itemId) {
      loadItem(options.itemId, options);
    } else {
      createItem(function(err, result){
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
}

module.exports = EditorDefinition;
