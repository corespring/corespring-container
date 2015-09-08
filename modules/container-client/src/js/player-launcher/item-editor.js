function EditorDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var instance;
  
  function createItem(callback){

    var call = launcher.loadCall('itemEditor.createItem');

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

    var callKey = 'itemEditor.' + (options.devEditor ? 'devEditor' : 'editor');

    var call = launcher.loadCall(callKey, function(u){
      return u.replace(':itemId', itemId);
    });

    if (!call) {
      errorCallback(errorCodes.CANT_FIND_URL('cant find a url for key: ' + callKey));
      return;
    }

    var tab = options.selectedTab;

    if ('profile' === tab) {
      call.hash = '/profile';
    }

    if ('supporting-materials' === tab) {
      call.hash = '/supporting-materials';
    }

    var initialData = {};

    if(options.showSaveMessage){
      initialData.showSaveMessage = options.showSaveMessage;
    }

    if(options.profileConfig){
      initialData.profileConfig = options.profileConfig;
    }

    function onReady(instance){
      if(options.devEditor){
        instance.css('height', '100%');
      }

      if(options.onItemLoaded){
        options.onItemLoaded(options.itemId);
      }
    }

    instance = launcher.loadInstance(call, options.queryParams, initialData, onReady);
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

  this.remove = function() {
    if(instance){
      instance.remove();
    }
  };
}

module.exports = EditorDefinition;
