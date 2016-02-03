function EditorDefinition(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var DraftId = require('draft-id');
  var instance;

  function createItemAndDraft(callback) {

    var call = launcher.loadCall('draftEditor.createItemAndDraft');
    if (!call) {
      return;
    }

    callback = callback || function() {};

    $.ajax({
      type: call.method,
      url: launcher.prepareUrl(call.url),
      data: {
        draftName: options.draftName
      },
      success: onSuccess,
      error: onError.bind(this),
      dataType: 'json'
    });

    function onSuccess(result) {
      if (options.onItemCreated) {
        options.onItemCreated(result.itemId);
      }

      if (options.onDraftCreated) {
        options.onDraftCreated(result.itemId, result.draftName);
      }

      callback(null, result);
    }

    function onError(xhrErr) {
      var msg = (xhrErr.responseJSON && xhrErr.responseJSON.error) ?
        xhrErr.responseJSON.error : 'Failed to create item and draft: ' + options.draftId;
      callback(msg);
    }

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

    if (options.showSaveMessage) {
      initialData.showSaveMessage = options.showSaveMessage;
    }

    if (options.hideSaveButton) {
      initialData.hideSaveButton = options.hideSaveButton;
    }

    if (options.profileConfig) {
      initialData.profileConfig = options.profileConfig;
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
      var draftId = new DraftId(options.itemId, options.draftName);
      loadDraftItem(draftId.toString(), options);
    } else {
      createItemAndDraft(function(err, result) {

        if (err) {
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

      var call = launcher.loadCall('draftEditor.commitDraft', function(u) {
        return u.replace(':draftId', new DraftId(options.itemId, options.draftName).toString());
      });

      function onSuccess(result) {
        if (callback) {
          callback(null);
        }
      }

      function onError(err) {
        var msg = (err.responseJSON && err.responseJSON.error) ? err.responseJSON.error : 'Failed to commit draft: ' + options.draftId;
        if (callback) {
          callback(errorCodes.COMMIT_DRAFT_FAILED(msg));
        }
      }

      $.ajax({
        type: call.method,
        url: launcher.prepareUrl(call.url, {
          force: force
        }),
        data: {},
        success: onSuccess,
        error: onError,
        dataType: 'json'
      });
    });
  };

  this.remove = function() {
    if (instance) {
      instance.remove();
    }
  };


}

module.exports = EditorDefinition;