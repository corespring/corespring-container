var UrlBuilder = require('url-builder');

function Helper(){
  var instanceCallbackHandler = require('callback-utils').instanceCallbackHandler; 
  this.instanceCallbackHandler = instanceCallbackHandler;

  this.addCoreMethods = function(instance){
    this.showNavigation = function(show){
      instance.send('showNavigation', show);
    };

    this.showPane = function(pane, done){
      instance.send('showPane', pane, instanceCallbackHandler(done));
    };

    this.remove = function() {
      if(instance){
        instance.remove();
      }
    };
  };

  this.jsonXhr = function(call, data, done, defaultErrorMsg){

    if (!call) {
      done(errorCodes.CALL_IS_UNDEFINED);
      return;
    }
    
    if (!call.url) {
      done(errorCodes.CANT_FIND_URL('cant find a url for key: ' + call.key));
      return;
    }

    function prepareUrl(u, params){
      params = $.extend(call.queryParams, params); 
      return new UrlBuilder(u).params(params).build(); 
    }

    defaultErrorMsg = defaultErrorMsg || 'Call to: ' + call.url + ' failed';

    function onError(xhrErr){
      var msg = (xhrErr.responseJSON && xhrErr.responseJSON.error) ?
        xhrErr.responseJSON.error : defaultErrorMsg;
      done(msg);
    }

    $.ajax({
      type: call.method,
      url: prepareUrl(call.url),
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: done.bind(this, null),
      error: onError,
      dataType: 'json'
    });
  };

  this.launchData = function(options, uploadUrl, xhtml, componentModel){
    return {
      activePane: options.activePane || 'config',
      showNavigation: options.showNavigation === true || false,
      uploadUrl: uploadUrl,
      xhtml: xhtml,
      componentModel: componentModel
    };
  };
}

var errorCodes = require('error-codes');
var helper = new Helper();

function Standalone(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var instance;

  function launchComponentEditorInstance(componentType){
    var call = launcher.loadCall('standaloneEditor', function(u){
      return u.replace(':componentType', componentType);
    });

    if(!call || !call.url){
      errorCallback(errorCodes.CANT_FIND_URL('standaloneEditor'));
      return;
    }

    var initialData = helper.launchData(options, options.uploadUrl, options.markup, options.data);
    instance = launcher.loadInstance(call, options.queryParams, initialData);
    helper.addCoreMethods.bind(this)(instance);
  }
  
  if(!options.componentType) {
    errorCallback(errorCodes.NO_COMPONENT_TYPE);
    return;
  }

  if(options.uploadUrl && options.uploadUrl.indexOf(':filename') === -1){
    errorCallback(errorCodes.UPLOAD_URL_MISSING_FILENAME);
    return;
  } 

  var ok = launcher.init();

  if(ok){
    launchComponentEditorInstance.bind(this)(options.componentType);
  } else {
    return;
  }

  this.getData = function(done){
    instance.send('getData', helper.instanceCallbackHandler(done));
  };

  this.setData = function(data, done){
    instance.send('setData', data, helper.instanceCallbackHandler(done));
  };
}

function CorespringBound(bindType, options, errorCallback){
    
  function addId(u){
    return u.replace(':' + bindType + 'Id', options[bindType + 'Id']);
  }

  this.launchComponentEditorInstance = function(item, launcher, done){

    var keys = Object.keys(item.components || {});

    if(keys.length > 1 || keys.length === 0){
      errorCallback(errorCodes.ONLY_ONE_COMPONENT_ALLOWED);
      return;
    }

    var comp = item.components[keys[0]];
    var uploadCall = launcher.loadCall( bindType + 'Editor.singleComponent.upload', addId);

    if(!uploadCall.url){
      errorCallback(errorCodes.CANT_FIND_URL('upload'));
      return;
    }

    var call = launcher.loadCall( bindType + 'Editor.singleComponent.loadEditor', addId);

    if(!call){
      errorCallback(errorCodes.CANT_FIND_URL('loadEditor'));
      return;
    }

    var initialData = helper.launchData(options, uploadCall.url, item.xhtml, comp);
    
    var instance = launcher.loadInstance(call, options.queryParams, initialData, function(instance){
      instance.send('getComponentKey', function(err, key){
        if(err){
          errorCallback(errorCodes.INTERNAL_ERROR('getComponentKey'));
        } else {
          done(null, {instance: instance, componentKey: key});
        }
      });
    });
    return instance;
  };

  this.saveComponents = function(launcher, id, componentKey, data, done) {
    var key = bindType + 'Editor.singleComponent.saveComponents';
    var call = launcher.loadCall(key, function(u){
      return u.replace(':' + bindType + 'Id', id);
    });

    var componentData = {};
    componentData[componentKey] = data;
    helper.jsonXhr(call, componentData, done);
  };
}

function Item(element, options, errorCallback) {
  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var itemBound = new CorespringBound('item', options, errorCallback);
  var instance, componentKey;

  function createItem(componentType, done){

    var key = 'itemEditor.singleComponent.createWithSingleComponent';

    var call = launcher.loadCall(key, function(u){
      return u.replace(':componentType', componentType);
    });

    done = done || function(){};

    helper.jsonXhr(call, {}, function(err, result){
      if(err){
        done(err);
      } else {
        if(options.onItemCreated){
          options.onItemCreated(result.itemId);
        }
        done(null, result);
      }
    }, 'Failed to create item.');
  }

  function loadItemData(itemId, done) {

    if (!itemId) {
      done(errorCallback.INVALID_ITEM_ID(itemId));
      return;
    }

    var callKey = 'itemEditor.singleComponent.loadData';

    var call = launcher.loadCall(callKey, function(u){
      return u.replace(':itemId', itemId);
    });

    helper.jsonXhr(call, {}, done, 'Failed to load item.');
  }

  function launchComponentEditorInstance(item){
    instance = itemBound.launchComponentEditorInstance(item, launcher, function(err, data){
      componentKey = data.componentKey;
    });
    helper.addCoreMethods.bind(this)(instance);
  }

  function saveComponents(id, data, done){
    itemBound.saveComponents(launcher, id, componentKey, data, done);
  }

  var ok = launcher.init();
    
  function onItemLoaded(err, item){
    if(err){
      errorCallback(errorCodes.LOAD_ITEM_FAILED(err));
    } else { 
      launchComponentEditorInstance.bind(this)(item);
    }
  }

  if(ok){
    if (options.itemId) {
      loadItemData.bind(this)(options.itemId, onItemLoaded);
    } else {
      createItem(options.componentType, function(err, result){
        if(err){
          errorCallback(errorCodes.CREATE_ITEM_FAILED(err));
        } else {
          options.itemId = result.itemId;
          loadItemData(options.itemId, onItemLoaded.bind(this));
        }
      }.bind(this));
    }
  } else {
    return;
  }


  this.save = function(done){
    instance.send('getData', function(err, data){
      saveComponents(options.itemId, data, function(err,saveResult){
        done({error: err, result: saveResult});
      });
    });
  };
}

function Draft(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var DraftId = require('draft-id');
  var draftBound = new CorespringBound('draft', options, errorCallback);
  var draft = require('draft');
  var instance, componentKey;
  
  function createItemAndDraft(componentType, callback){
    var key = 'draftEditor.singleComponent.createWithSingleComponent';
    var call = launcher.loadCall(key, function(u){
      return u.replace(':componentType', componentType);
    });
    call.url = launcher.prepareUrl(call.url);
    draft.createItemAndDraft(call, options, callback);
  }

  function loadDraftData(draftId, done) {

    if (!draftId) {
      errorCodes.INVALID_DRAFT_ID(draftId);
      return;
    }

    var callKey = 'draftEditor.singleComponent.loadData';

    var call = launcher.loadCall(callKey, function(u){
      return u.replace(':draftId', draftId);
    });

    helper.jsonXhr(call, {}, done, 'Failed to load draft');
  }

  function launchComponentEditorInstance(item){
    instance = draftBound.launchComponentEditorInstance(item, launcher, function(err, data){
        componentKey = data.componentKey;
    });
    helper.addCoreMethods.bind(this)(instance);
  }

  function saveComponents(draftId, data, done){
    draftBound.saveComponents(launcher, draftId, componentKey, data, done);
  }

  var ok = launcher.init();
    
  function onDraftLoaded(err, draft){
    if(err){
      errorCallback(errorCodes.LOAD_DRAFT_FAILED(err));
    } else { 
      launchComponentEditorInstance.bind(this)(draft);
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
          loadDraftData.bind(this)(options.draftId.toString(), onDraftLoaded.bind(this));
        }
      }.bind(this));
    }
  } else {
    return;
  }


  this.save = function(done){
    instance.send('getData', function(err, data){
      saveComponents(options.draftId, data, function(err,saveResult){
        done({error: err, result: saveResult});
      });
    });
  };

  this.commitDraft = function(force, done){
    this.save(function(result){
      if(result.error){
        done(result.error);
      } else {
        var key = 'draftEditor.singleComponent.commit';
        var call = launcher.loadCall(key, function(u){
          return u.replace(':draftId', options.draftId.toString());
        });
        var url = launcher.prepareUrl(call.url, {force: force});
        draft.xhrCommitDraft(call.method, url, options.draftId, done);
      }
    });
  };
}

//Private - exposed for testing
exports._CorespringBound = CorespringBound;
exports._Helper = Helper;

//Public
exports.Standalone = Standalone;
exports.Draft = Draft;
exports.Item = Item;