function EditorDefinition(element, options, errorCallback) {

  var isReady = false;
  var errors = require('errors');
  var logger = options.logger || require('logger');
  var builder = new (require('url-builder'))();
  var queryParams = require('query-params');

  var defaultOptions = require('default-options');
  options = $.extend(defaultOptions, options);

  var paths = defaultOptions.paths;
  var InstanceDef = require('instance');

  errorCallback = errorCallback || function (error) {
    throw 'error occurred, code: ' + error.code + ', message: ' + error.message;
  };

  function makeUrl(url, queryParams) {
    return builder.build(url, queryParams);
  }

  function hasLauncherErrors() {
    var launcherErrors = require('launcher-errors');
    if (launcherErrors.hasErrors()) {
      for (var i = 0; i < launcherErrors.errors.length; i++) {
        errorCallback(errors.EXTERNAL_ERROR(launcherErrors.errors[i]));
      }
      return true;
    }
    return false;
  }

  function loadMethodAndUrl(name) {
    if (!options.paths || !options.paths[name]) {
      errorCallback({
        code: 105,
        message: name + ' not part of options'
      });
      return null;
    }
    return options.paths[name];
  }

  function createItem(options, callback) {
    var createCall = loadMethodAndUrl('create');
    if (!createCall) {
      return;
    }

    callback = callback || function(){};

    function onSuccess(result){
      if(options.onItemCreated){
        options.onItemCreated(result.id);
      }
      callback(null, result);
    } 

    $.ajax({
      type: createCall.method,
      url: makeUrl(options.corespringUrl + createCall.url, queryParams),
      data: options,
      success: onSuccess,
      error: callback.bind(this),
      dataType: 'json'
    });
  }

  function createDraft(itemId, callback){
     logger.log('create draft for item: ', itemId);

     var call = loadMethodAndUrl('createDraft');
     var url = call.url.replace(':itemId', itemId);

     callback = callback || function(){};

    function onSuccess(result){
      if(options.onDraftCreated){
        options.onDraftCreated(result.id);
      }
      callback(null, result);
    } 

    $.ajax({
      type: call.method,
      url: makeUrl(options.corespringUrl + url, queryParams),
      success: onSuccess,
      error: function(err){
        callback({code: 112, msg: 'Error creating draft'});
      }
    });
  }

  function loadDraftItem(draftId, options) {
    logger.log('load draft item');

    if(options.devEditor){
      throw new Error('dev editor launching isn\'t ready');
    }
    
    var loadCall = options.devEditor ? loadMethodAndUrl('devEditor') : loadMethodAndUrl('editor');
    if (!loadCall) {
      return;
    }

    var tab = options.selectedTab;
    if ('profile' === tab) {
      options.hash = '/profile';
    }
    if ('supporting-materials' === tab) {
      options.hash = '/supporting-materials/0';
    }

    options.url = (options.corespringUrl + loadCall.url).replace(':draftId', draftId);
    options.queryParams = require('query-params');

    var instance = new InstanceDef(element, options, errorCallback, logger);

    instance.on('launch-error', function (data) {
      var error = errors.EXTERNAL_ERROR(data.code + ': ' + data.detailedMessage);
      errorCallback(error);
    });

    instance.on('ready', function() {
      if (isReady) {
        instance.removeChannel();
        errorCallback(errors.EDITOR_NOT_REMOVED);
      } else {
        isReady = true;
        instance.send('initialise', options);
        if(options.onDraftLoaded){
          options.onDraftLoaded();
        }
      }
    });
  }


  function init(){
    if (hasLauncherErrors()) {
      return;
    }

    if(options.itemId){
      createDraft(options.itemId, function(err, result){
        options.draftId = result.id;
        loadDraftItem(result.id, options);
      });
    } else if(options.draftId){
      loadDraftItem(options.draftId, options);
    } else {
      createItem(options, function(err, result){
        createDraft(result.id, function(err, result){
          options.draftId = result.id;
          loadDraftItem(result.id, options);
        });
      });
    }
  }

  /** Public functions */
  this.commitDraft = function(force, callback){
    var call = loadMethodAndUrl('commitDraft');
    var url = call.url.replace(':draftId', options.draftId);
    var method = call.method;

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
      type: method,
      url: makeUrl(options.corespringUrl + url, _.extend(queryParams, {force: force})),
      data: options,
      success: onSuccess,
      error: onError,
      dataType: 'json'
    });
  };

  init();

}

module.exports = EditorDefinition;