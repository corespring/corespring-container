function EditorDefinition(element, options, errorCallback) {

  var isReady = false;
  var errors = require("errors");
  var logger = options.logger || require('logger');

  errorCallback = errorCallback || function (error) {
    throw "error occurred, code: " + error.code + ", message: " + error.message;
  };

  function hasLauncherErrors() {
    var launcherErrors = require("launcher-errors");
    if (launcherErrors.hasErrors()) {
      for (var i = 0; i < launcherErrors.errors.length; i++) {
        errorCallback(errors.EXTERNAL_ERROR(launcherErrors.errors[i]));
      }
      return true;
    }
    return false;
  }

  if (hasLauncherErrors()) {
    return;
  }

  function hasInvalidOptions() {
    var defaultOptions = require("default-options");
    options = $.extend(defaultOptions, options);

    function validateOptions(options) {
      return [];
    }

    var result = validateOptions(options);

    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        errorCallback(result[i]);
      }
      return true;
    }
    return false;
  }

  if (hasInvalidOptions()) {
    return;
  }


  var InstanceDef = require("instance");

  function loadPaths(options, name) {
    if (!options.paths || !options.paths[name]) {
      errorCallback({
        code: 105,
        message: name + " not part of options"
      });
      return null;
    }
    return options.paths[name];
  }

  function makeUrl(url, queryParams) {
    var Builder = require('url-builder');
    return new Builder().build(url, queryParams);
  }

  function createItem(options, onSuccess, onError) {
    var createCall = loadPaths(options, "create");
    if (!createCall) {
      return;
    }

    var queryParams = require('query-params');

    $.ajax({
      type: createCall.method,
      url: makeUrl(options.corespringUrl + createCall.url, queryParams),
      data: options,
      success: onSuccess,
      error: onError,
      dataType: "json"
    });
  }

  function loadItem(itemId, options) {
    var loadCall = loadPaths(options, "editor");
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

    options.url = (options.corespringUrl + loadCall.url).replace(":itemId", itemId);
    options.queryParams = require('query-params');

    var instance = new InstanceDef(element, options, errorCallback, logger);

    instance.on("launch-error", function (data) {
      var error = errors.EXTERNAL_ERROR(data.code + ": " + data.detailedMessage);
      errorCallback(error);
    });

    instance.on('ready', function () {
      if (isReady) {
        instance.removeChannel();
        errorCallback(errors.EDITOR_NOT_REMOVED);
      } else {
        isReady = true;
        instance.send('initialise', options);
      }
    });
  }

  if (options.itemId) {
    logger.log("loading item");
    loadItem(options.itemId, options);
  } else {
    createItem(options,
      function (data) {
        logger.log("item created");
        options.itemId = data.itemId;
        loadItem(data.itemId, options);
      },
      function (err) {
        logger.log(err);
      });
  }

}

module.exports = EditorDefinition;