function EditorDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback);
  var errorCodes = require('error-codes');

  var self = this;
  var saveCallback;
  var channel;

  function createItemAndDraft(callback){

    var call = launcher.loadCall('draftEditor.createItemAndDraft');

    if (!call) {
      return;
    }

    callback = callback || function(){};

    function onSuccess(result){

      if(options.onItemCreated){
        options.onItemCreated(result.itemId);
      }

      if(options.onDraftCreated){
        options.onDraftCreated(result.itemId, result.draftName);
      }

      callback(null, result);
    }

    function onError(xhrErr){
      var msg = (xhrErr.responseJSON && xhrErr.responseJSON.error) ?
        xhrErr.responseJSON.error : 'Failed to create item and draft: ' + options.draftId;
      callback(msg);
    }

    $.ajax({
      type: call.method,
      url: launcher.prepareUrl(call.url),
      data: { draftName: options.draftName },
      success: onSuccess,
      error: onError.bind(this),
      dataType: 'json'
    });
  }

  function loadDraftItem(draftId, options) {

    if (!draftId) {
      throw new Error('invalid draftId');
    }

    var call = launcher.loadCall(options.devEditor ? 'draftEditor.devEditor' : 'draftEditor.editor', function(u){
      return u.replace(':draftId', draftId);
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

      if(options.onDraftLoaded){
        options.onDraftLoaded(options.itemId, options.draftName);
      }
    }

    var instance = launcher.loadInstance(call, options.queryParams, initialData, onReady);
  }

  var ok = launcher.init();

  if(ok){
    options.draftName = options.draftName || msgr.utils.getUid(); //jshint ignore:line

    if (options.itemId) {
      var draftId = new DraftId(options.itemId, options.draftName);
      loadDraftItem(draftId.toString(), options);
    } else {
      createItemAndDraft(function(err, result){

        if(err){
          errorCallback(errorCodes.CREATE_ITEM_AND_DRAFT_FAILED(err));
        } else {
          options.itemId = result.itemId;
          options.draftName = result.draftName;
          var draftId = new DraftId(options.itemId, options.draftName);
          loadDraftItem(draftId.toString(), options);
        }
      });
    }

  } else {
    return;
  }

  function DraftId(itemId,name){
    this.toString = function(){
      return itemId + '~' + name;
    };
  }

  $(function() {
    channel =
      new msgr.Channel(window, options.iframe ? options.iframe.contentWindow : $('iframe')[0].contentWindow, {enableLogging: true});
    channel.on('savedAll', function() {
      self.commitDraft(false, function() {
        if (saveCallback) {
          saveCallback();
          saveCallback = undefined;
        }
      });
    });
  });

  /** Public functions */
  this.forceSave = function(callback) {
    saveCallback = callback;
    channel.send('saveAll');
  };

  this.commitDraft = function(force, callback) {
    var call = launcher.loadCall('draftEditor.commitDraft', function(u){
      return u.replace(':draftId',new DraftId(options.itemId, options.draftName).toString());
    });

    function onSuccess(result){
      if(callback){
        callback(null);
      }
    }

    function onError(err){
      var msg = (err.responseJSON && err.responseJSON.error) ? err.responseJSON.error : 'Failed to commit draft: ' + options.draftId;
      if(callback){
        callback(errorCodes.COMMIT_DRAFT_FAILED(msg));
      }
    }

    $.ajax({
      type: call.method,
      url: launcher.prepareUrl(call.url, {force: force}),
      data: {},
      success: onSuccess,
      error: onError,
      dataType: 'json'
    });
  };

}

module.exports = EditorDefinition;
