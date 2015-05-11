function EditorDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback);
  var UrlBuilder = require('url-builder');
  var builder = new UrlBuilder();

  function createItemAndDraft(callback){

    var call = launcher.loadCall('createItemAndDraft');

    if (!call) {
      return;
    }

    launcher.log('create item and draft');

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

    $.ajax({
      type: call.method,
      url: launcher.prepareUrl(call.url),
      data: options,
      success: onSuccess,
      error: callback.bind(this),
      dataType: 'json'
    });
  }

  var errors = require('errors');

  function loadDraftItem(draftId, options) {

    if(!draftId){
      throw new Error('invalid draftId');
    }

    var call = launcher.loadCall(options.devEditor ? 'devEditor' : 'editor', function(u){
      return u.replace(':draftId', draftId);
    });

    if (!call) {
      errorCallback(errors.NO_DRAFT_ID);
      return;
    }

    var tab = options.selectedTab;

    if ('profile' === tab) {
      call.hash = '/profile';
    }

    if ('supporting-materials' === tab) {
      call.hash = '/supporting-materials/0';
    }

    var initialData = {todo: true};

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

    if(options.itemId){
      var draftId = new DraftId(options.itemId, options.draftName);
      loadDraftItem(draftId.toString(), options);
    } else {
      createItemAndDraft(function(err, result){
        options.itemId = result.itemId;
        options.draftName = result.draftName;
        var draftId = new DraftId(options.itemId, options.draftName);
        loadDraftItem(draftId.toString(), options);
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

  /** Public functions */
  this.commitDraft = function(force, callback){
    var call = launcher.loadCall('commitDraft', function(u){
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
        callback({code: 111, msg: msg});
      }
    }

    $.ajax({
      type: call.method,
      url: builder.build(call.url, $.extend(options.queryParams, {force: force})),
      data: options,
      success: onSuccess,
      error: onError,
      dataType: 'json'
    });
  };
}

module.exports = EditorDefinition;
