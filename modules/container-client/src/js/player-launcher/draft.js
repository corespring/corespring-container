exports.createItemAndDraft = function(call, options, callback) {

    callback = callback || function() {};

    $.ajax({
      type: call.method,
      url: call.url,
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

};