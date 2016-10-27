function EditorDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var DraftId = require('draft-id');
  var draft = require('draft');
  var instance;

  function createItemAndDraft(callback) {
    var call = launcher.loadCall('draftEditor.createItemAndDraft');
    call.url = launcher.prepareUrl(call.url) ;
    draft.createItemAndDraft(call, options, callback);
  }

  function loadDraftItem(draftId, options) {

    if (!draftId) {
      throw new Error('invalid draftId');
    }

    var call = launcher.loadCall(options.devEditor ? 'draftEditor.devEditor' : 'draftEditor.editor', function(u) {
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
      call.hash = '/supporting-materials';
    }

    var initialData = {};
    options = options || {};
    var propsToCopy = ['showSaveMessage', 'hideSaveButton', 'profileConfig', 'tabs'];
    for (var i = 0; i < propsToCopy.length; i++) {
      var prop = propsToCopy[i];
      if (options[prop]) {
        initialData[prop] = options[prop];
      }
    }
    instance = launcher.loadInstance(call, options.queryParams, initialData, onReady);

    if (typeof(options.onItemChanged) === 'function') {
      instance.on('itemChanged', function(data) {
        options.onItemChanged(data);
      });
    }

    function onReady(instance) {
      if (options.devEditor) {
        instance.css('height', '100%');
      }

      if (options.onDraftLoaded) {
        options.onDraftLoaded(options.itemId, options.draftName);
      }
    }
  }

  var ok = launcher.init();

  if (ok) {
    options.draftName = options.draftName || msgr.utils.getUid(); //jshint ignore:line

    if (options.itemId) {
      options.draftId = new DraftId(options.itemId, options.draftName);

      loadDraftItem(options.draftId.toString(), options);
    } else {
      createItemAndDraft(function(err, result) {
        if (err) {
          errorCallback(err);
        } else {
          options.itemId = result.itemId;
          options.draftName = result.draftName;
          options.draftId = new DraftId(options.itemId, options.draftName);
          loadDraftItem(options.draftId.toString(), options);
        }
      });
    }
  } else {
    errorCallback(errorCodes.INITIALISATION_FAILED);
    return;
  }
  
  /** Public functions */
  this.forceSave = function(callback) {
    instance.send('saveAll', function(err, data) {
      callback(err, data);
    });
  };

  this.commitDraft = function(force, callback) {
    this.forceSave(function(err, data) {

      if (err) {
        callback(err);
        return;
      }

      var draftId =  new DraftId(options.itemId, options.draftName);
      var call = launcher.loadCall('draftEditor.commitDraft', function(u) {
        return u.replace(':draftId', draftId.toString());
      });

      var url = launcher.prepareUrl(call.url, {force: force});

      draft.xhrCommitDraft(call.method, url, options.draftId, callback);
    });
  };

  this.remove = function() {
    if (instance) {
      instance.remove();
    }
  };
}

module.exports = EditorDefinition;