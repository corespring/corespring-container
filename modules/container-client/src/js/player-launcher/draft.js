var errorCodes = require('error-codes');

function xhrToMsg(xhrErr, fallback){
  return (xhrErr.responseJSON && xhrErr.responseJSON.error) ? 
    xhrErr.responseJSON.error : fallback;
}

function onError(callback, generator, xhrErr) {
  var msg = xhrToMsg(xhrErr, '');
  callback(generator(msg));
}

exports.createItemAndDraft = function(call, options, callback) {

  callback = callback || function() {};

  var params = {
    draftName : options.draftName
  };

  if(options.collectionId){
    params.collectionId = options.collectionId;
  }

  $.ajax({
    type: call.method,
    url: call.url,
    data: params,
    success: onSuccess,
    error: onError.bind(null, callback, errorCodes.CREATE_ITEM_AND_DRAFT_FAILED),
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
};


exports.xhrCommitDraft = function(method, url, draftId, callback){
  $.ajax({
    type: method,
    url: url, 
    data: {},
    success: callback.bind(null, null),
    error: onError.bind(null, callback, errorCodes.COMMIT_DRAFT_FAILED),
    dataType: 'json'
  });
};