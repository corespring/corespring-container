function DraftComponentEditor(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var DraftId = require('draft-id');
  var instance;
  
  function createItemAndDraft(componentType, callback){

    var key = 'draftEditor.singleComponent.createWithSingleComponent';

    var call = launcher.loadCall(key, function(u){
      return u.replace(':componentType', componentType);
    });

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
      data: JSON.stringify({}),
      success: onSuccess,
      error: onError.bind(this),
      dataType: 'json'
    });
  }

  function loadDraftData(draftId, callback) {

    if (!draftId) {
      throw new Error('invalid draftId');
    }

    var callKey = 'draftEditor.singleComponent.loadData';

    var call = launcher.loadCall(callKey, function(u){
      return u.replace(':draftId', draftId);
    });

    if (!call) {
      errorCallback(errorCodes.CANT_FIND_URL('cant find a url for key: ' + callKey));
      return;
    }

    function onError(xhrErr){
      var msg = (xhrErr.responseJSON && xhrErr.responseJSON.error) ?
        xhrErr.responseJSON.error :
       'Failed load draft.';
      callback(msg);
    }

    $.ajax({
      type: call.method,
      url: launcher.prepareUrl(call.url),
      contentType: 'application/json',
      success: callback.bind(this, null),
      error: onError.bind(this),
      dataType: 'json'
    });
  }

  function launchComponentEditor(item){

    var comp;
    for(var i  in item.components){
      if(!comp){
        comp = item.components[i];
      }
    }

    var uploadUrl = launcher.loadCall('draftEditor.singleComponent.upload', function(u){
      return u.replace(':draftId', options.draftId);
    }).url;

    // var editorOpts = {
    //   componentType: comp.componentType,
    //   componentModel: comp,
    //   xhtml: item.xhtml,
    //   uploadUrl: uploadUrl 
    // };

    ////
     var call = launcher.loadCall('draftEditor.singleComponent.load', function(u){
      return u.replace(':draftId', options.draftId);
    });

    if(!call){
      errorCallback('???');
      return;
    }

    function onReady(instance){
      // console.log('onReady...', instance); 
    }

    var initialData = {
      activePane: options.activePane || 'config',
      showNavigation: options.showNavigation === true || false,
      uploadUrl: options.uploadUrl
    };

    instance = launcher.loadInstance(call, options.queryParams, initialData, onReady);
  }


  function saveComponent(draftId, data, done){

    var key = 'draftEditor.singleComponent.saveComponents';
    var call = launcher.loadCall(key, function(u){
      return u.replace(':draftId', draftId);
    });

    var componentData = {
      1: data
    };

    $.ajax({
      type: call.method,
      url: launcher.prepareUrl(call.url),
      data: JSON.stringify(componentData),
      contentType: 'application/json',
      success: done.bind(this, null),
      error: done,
      dataType: 'json'
    });
  }

  var ok = launcher.init();
    
  function onDraftLoaded(err, draft){
    if(err){
      errorCallback(errorCodes.LOAD_DRAFT_FAILED(err));
    } else { 
      launchComponentEditor(draft);
    }
  }

  if(ok){

    if (options.itemId) {
      options.draftName = options.draftName || msgr.utils.getUid(); //jshint ignore:line
      options.draftId = new DraftId(options.itemId, options.draftName);
      loadDraftData(options.draftId.toString(), onDraftLoaded);
    } else {
      createItemAndDraft(options.componentType, function(err, result){
        if(err){
          errorCallback(errorCodes.CREATE_DRAFT_FAILED(err));
        } else {
          options.itemId = result.itemId;
          options.draftName = result.draftName;
          options.draftId = new DraftId(options.itemId, options.draftName);
          loadDraftData(options.draftId.toString(), onDraftLoaded);
        }
      });
    }
  } else {
    return;
  }

  this.showNavigation = function(show){
    componentEditor.showNavigation(show);
  };

  this.previewEnabled = function(enabled){
    componentEditor.previewEnabled(enabled);
  };

  this.showPane = function(pane, done){
    componentEditor.showPane(pane, done);
  };

  this.getData = function(done){
    componentEditor.getData(done);
  };

  this.save = function(done){
    componentEditor.getData(function(data){
      saveComponent(options.draftId, data.result, function(err,saveResult){
        done({error: err, result: saveResult});
      });
    });
  };
  
  this.remove = function() {
    componentEditor.remove();
  };
}

module.exports = DraftComponentEditor;