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

  function createItemAndDraft(callback){

    var call = loadMethodAndUrl('createItemAndDraft');

    if (!call) {
      return;
    }

    logger.log('create item and draft');

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
      url: makeUrl(options.corespringUrl + call.url, queryParams),
      data: options,
      success: onSuccess,
      error: callback.bind(this),
      dataType: 'json'
    });
  }

  function loadDraftItem(draftId, options) {

    if(!draftId){
      throw new Error('invalid draftId');
    }

    logger.log('load draft item');

    // if(options.devEditor){
    //   throw new Error('dev editor launching isn\'t ready');
    // }

    var call = options.devEditor ? loadMethodAndUrl('devEditor') : loadMethodAndUrl('editor');

    if (!call) {
      throw new Error('can\'t find call for editor');
    }

    var tab = options.selectedTab;

    if ('profile' === tab) {
      options.hash = '/profile';
    }

    if ('supporting-materials' === tab) {
      options.hash = '/supporting-materials/0';
    }

    options.url = (options.corespringUrl + call.url)
      .replace(':draftId', draftId);

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

        if(options.devEditor){
          instance.css('height', '100%');
        }

        if(options.onDraftLoaded){
          options.onDraftLoaded(options.itemId, options.draftName);
        }
      }
    });
  }

  function DraftId(itemId,name){
    this.toString = function(){
      return itemId + '~' + name;
    };
  }

  function init(){
    if (hasLauncherErrors()) {
      return;
    }

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
  }

  /** Public functions */
  this.commitDraft = function(force, callback){
    var call = loadMethodAndUrl('commitDraft');
    var url = call.url
      .replace(':draftId', new DraftId(options.itemId, options.draftName).toString());

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
