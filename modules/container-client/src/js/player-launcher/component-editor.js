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

    function onError(xhrErr){
      var msg = (xhrErr.responseJSON && xhrErr.responseJSON.error) ?
        xhrErr.responseJSON.error : defaultErrorMsg;
      done(msg);
    }

    $.ajax({
        type: call.method,
        url: call.url,
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
var Launcher = require('client-launcher');
var helper = new Helper();


function Standalone(element, options, errorCallback) {

  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var instance;

  function loadConfigPanel(componentType){
    var call = launcher.loadCall('standaloneEditor', function(u){
      return u.replace(':componentType', componentType);
    });

    if(!call){
      errorCallback(errorCodes.CANT_FIND_URL('standaloneEditor'));
      return;
    }

    var initialData = helper.launchData(options, options.uploadUrl, options.markup, options.data);
    instance = launcher.loadInstance(call, options.queryParams, initialData);
  }

  var ok = launcher.init(function(){
    if(options.uploadUrl && options.uploadUrl.indexOf(':filename') === -1){
      return [errorCodes.UPLOAD_URL_MISSING_FILENAME];
    } else {
      return [];
    }
  });

  if(ok){
    loadConfigPanel(options.componentType);
  } else {
    return;
  }

  helper.addCoreMethods(instance).bind(this);

  this.getData = function(done){
    instance.send('getData', helper.instanceCallbackHandler(done));
  };

  this.setData = function(data, done){
    instance.send('setData', data, helper.instanceCallbackHandler(done));
  };
}

function Item(element, options, errorCallback) {

  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var instance;

  function createItem(componentType, done){

    var key = 'itemEditor.singleComponent.createWithSingleComponent';

    var call = launcher.loadCall(key, function(u){
      return u.replace(':componentType', componentType);
    });

    if (!call) {
      return;
    }

    done = done || function(){};

    call.url = launcher.prepareUrl(call.url); 
    
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

  function loadItemData(itemId, callback) {

    if (!itemId) {
      throw new Error('invalid itemId');
    }

    var callKey = 'itemEditor.singleComponent.loadData';

    var call = launcher.loadCall(callKey, function(u){
      return u.replace(':itemId', itemId);
    });

    if (!call) {
      errorCallback(errorCodes.CANT_FIND_URL('cant find a url for key: ' + callKey));
      return;
    }

    function onError(xhrErr){
      var msg = (xhrErr.responseJSON && xhrErr.responseJSON.error) ?
        xhrErr.responseJSON.error :
       'Failed to load item.';
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

    var uploadUrl = launcher.loadCall('itemEditor.singleComponent.upload', function(u){
      return u.replace(':itemId', options.itemId);
    }).url;

    var call = launcher.loadCall('itemEditor.singleComponent.loadEditor', function(u){
      return u.replace(':itemId', options.itemId);
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
      uploadUrl: uploadUrl,
      xhtml: item.xhtml,
      componentModel: item.components['1']
    };

    instance = launcher.loadInstance(call, options.queryParams, initialData, onReady);
  }


  function saveComponent(id, data, done){

    var key = 'itemEditor.singleComponent.saveComponents';
    var call = launcher.loadCall(key, function(u){
      return u.replace(':itemId', id);
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
    
  function onItemLoaded(err, item){
    if(err){
      errorCallback(errorCodes.LOAD_ITEM_FAILED(err));
    } else { 
      launchComponentEditor(item);
    }
  }

  if(ok){

    if (options.itemId) {
      loadItemData(options.itemId, onItemLoaded);
    } else {
      createItem(options.componentType, function(err, result){
        if(err){
          errorCallback(errorCodes.CREATE_ITEM_FAILED(err));
        } else {
          options.itemId = result.itemId;
          loadItemData(options.itemId, onItemLoaded);
        }
      });
    }
  } else {
    return;
  }

  var instanceCallbackHandler = callbackUtils.instanceCallbackHandler;

  this.showNavigation = function(show){
    instance.send('showNavigation', show);
  };

  this.showPane = function(pane, done){
    instance.send('showPane', pane, instanceCallbackHandler(done));
  };

  this.save = function(done){
    instance.send('getData', function(err, data){
      saveComponent(options.itemId, data, function(err,saveResult){
        done({error: err, result: saveResult});
      });
    });
  };

  this.remove = function() {
    instance.remove();
  };
}

module.exports = ItemComponentEditor;

exports.Standalone = Standalone;
exports.Draft = Draft;
exports.Item= Item;


