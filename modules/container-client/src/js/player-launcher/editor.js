var EditorDefinition = function(element, options, errorCallback) {

  var errors = require("errors");
  var launcherErrors = require("launcher-errors");
  var i;

  if (launcherErrors.hasErrors) {
    for (i = 0; i < launcherErrors.errors.length; i++) {
      errorCallback(errors.EXTERNAL_ERROR(launcherErrors.errors[i]));
    }
    return;
  }

  var isReady = false;

  var defaultOptions = require("default-options");

  options = $.extend(defaultOptions, options);

  var validateOptions = function(options) {
    return [];
  };

  var result = validateOptions(options);

  if (result.length > 0) {
    for (i = 0; i < result.length; i++) {
      errorCallback(result[i]);
    }
    return;
  }

  var InstanceDef = require("instance");

  errorCallback = errorCallback || function(error) {
    throw "error occurred, code: " + error.code + ", message: " + error.message;
  };

  var loadPaths = function(options, name) {
    if (!options.paths || !options.paths[name]) {
      errorCallback({
        code: -1,
        message: name + " not part of options"
      });
      return;
    }
    return options.paths[name];
  };

  var createItem = function(options, onSuccess, onError) {
    var createCall = loadPaths(options, "create");

    $.ajax({
      type: createCall.method,
      url: options.corespringUrl + createCall.url,
      data: options,
      success: onSuccess,
      error: onError,
      dataType: "json"
    });
  };

  var loadItem = function(itemId, options) {
    var editorPaths = loadPaths(options, "editor");
    options.url = (options.corespringUrl + editorPaths.url).replace(":itemId", itemId);

    options.queryParams = require('query-params');

    var instance = new InstanceDef(element, options, errorCallback);

    instance.addListener("launch-error", function(data) {
      var error = errors.EXTERNAL_ERROR(data.code + ": " + data.detailedMessage);
      errorCallback(error);
    });
  };

  if (!options.itemId) {
    createItem(options,
      function(data) {
        console.log("item created");
        loadItem(data.itemId, options);
      },
      function(err) {
        console.log(err);
      });
  } else {
    loadItem(options.itemId, options);
  }
};

module.exports = EditorDefinition;