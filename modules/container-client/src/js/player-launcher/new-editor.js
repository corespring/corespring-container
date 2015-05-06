function EditorDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback);

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

  function loadDraftItem(draftId, options) {

    if(!draftId){
      throw new Error('invalid draftId');
    }

    launcher.log('load draft item');

    var call = options.devEditor ? launcher.loadCall('devEditor') : launcher.loadCall('editor');

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

    var url = call.url.replace(':draftId', draftId);


    launcher.mkInstance(url, null, function onReady(instance){

      instance.send('initialise', options);

      if(options.devEditor){
        instance.css('height', '100%');
      }

      if(options.onDraftLoaded){
        options.onDraftLoaded(options.itemId, options.draftName);
      }
    });
  }


  launcher.loadClient = function(){
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
  };


  launcher.init();

  function DraftId(itemId,name){
    this.toString = function(){
      return itemId + '~' + name;
    };
  }

  /** Public functions */
  this.commitDraft = function(force, callback){
    var call = launcher.loadCall('commitDraft');
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
      url: launcher.prepareUrl({force: force}),
      data: options,
      success: onSuccess,
      error: onError,
      dataType: 'json'
    });
  };


}

module.exports = EditorDefinition;
