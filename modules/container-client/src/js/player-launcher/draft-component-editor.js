function DraftComponentEditor(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var DraftId = require('draft-id');
  var helper = require('./component-editor/helper');
  var draft = require('draft');

  var instance;
  
  function createItemAndDraft(componentType, callback){
    var key = 'draftEditor.singleComponent.createWithSingleComponent';
    var call = launcher.loadCall(key, function(u){
      return u.replace(':componentType', componentType);
    });
    call.url = launcher.prepareUrl(call.url);
    draft.createItemAndDraft(call, options, callback);
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

  function launchComponentEditorInstance(item){

    var comp;
    for(var i  in item.components){
      if(!comp){
        comp = item.components[i];
      }
    }

    function addDraftId(u){
      return u.replace(':draftId', options.draftId);
    }

    var uploadUrl = launcher.loadCall('draftEditor.singleComponent.upload', addDraftId);
    var call = launcher.loadCall('draftEditor.singleComponent.loadEditor', addDraftId); 

    if(!call){
      errorCallback(errorCodes.CANT_FIND_URL('draftEditor.singleComponent.loadEditor'));
      return;
    }

    var initialData = helper.launchData(options, uploadUrl, item.xhtml, item.components['1']);
    instance = launcher.loadInstance(call, options.queryParams, initialData);
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
      launchComponentEditorInstance(draft);
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

  var callbackUtils = require('callback-utils');
  var instanceCallbackHandler = callbackUtils.instanceCallbackHandler;

  this.showNavigation = function(show){
    instance.send('showNavigation', show);
  };

  this.showPane = function(pane, done){
    instance.send('showPane', pane, instanceCallbackHandler(done));
  };

  this.save = function(done){
    instance.send('getData', function(err, data){
      saveComponent(options.draftId, data, function(err,saveResult){
        done({error: err, result: saveResult});
      });
    });
  };

  this.commitDraft = function(force, done){
    
    function onError(err) {
      var msg = (err.responseJSON && err.responseJSON.error) ? err.responseJSON.error : 'Failed to commit draft: ' + options.draftId;
      if (done) {
        done(errorCodes.COMMIT_DRAFT_FAILED(msg));
      }
    }

    function onSuccess(result, msg, xhr){
      done(null, result);
    }

    this.save(function(result){
      if(result.error){
        done(result.error);
      } else {
        var key = 'draftEditor.singleComponent.commit';
        var call = launcher.loadCall(key, function(u){
          return u.replace(':draftId', options.draftId.toString());
        });

        $.ajax({
          type: call.method,
          url: launcher.prepareUrl(call.url, {force: force}),
          data: {},
          success: onSuccess,
          error: onError,
          dataType: 'json'
        });  
      }
    });
  };
  
  this.remove = function() {
    instance.remove();
  };
}

module.exports = DraftComponentEditor;