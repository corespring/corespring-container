var Instance = function(element, options, errorCallback, log) {

  /* global msgr, $ */
  /** msgr.Channel */
  var channel;

  var iframeUid = 'corespring-iframe-' + msgr.utils.getUid();

  var self = this;

  var UrlBuilder = require('url-builder');

  function $iframe() {
    var $node = $('#' + iframeUid);
    if($node.size() !== 1){
      var err = errors.CANT_FIND_IFRAME(iframeUid);
      errorCallback(err);
    }
    return $node;
  }

  var errors = require("errors");

  log = log || require('logger');

  function initialize(e, options) {
    if (!options || !options.sessionUrl) {
      errorCallback({
        code: 999,
        message: "No session url specified"
      });
      return;
    }

    if (!options || !options.url) {
      errorCallback({
        code: 999,
        message: "No url specified"
      });
      return;
    }

    if ($(e).length === 0) {
      errorCallback(errors.CANT_FIND_CONTAINER_FOR_PLAYER);
      return;
    }

    var iframeStyles = [
      '',
      '.player-loading{visibility: hidden; position: absolute;}',
      '.player-loaded{visibility: visible; position: initial;}'
    ].join('\n');

    // This is a workaround for IE* because $(iframe).css("absolute","initial") is not working
    (function injectPlayerStyles(){
      if ($('head #playerstyle').length === 0){
        $('head').append('<style id="playerstyle" type="text/css">' + iframeStyles + '</style>');
      }
    })();

    $.ajax({
      url: options.sessionUrl,
      async: false, // refactor this so that it's asynchronous.
      method: 'POST',
      dataType: 'json'
    }).done(loadSession);

    function loadSession(session) {

      var sessionId = session._id['$oid'];

      var url =
        new UrlBuilder(options.url)
          .params(options.queryParams)
          .hash(options.hash)
          .interpolate(':sessionId', sessionId)
          .build();

      var iframeTemplate = [
        '<iframe',
        ' id="', iframeUid , '"',
        ' frameborder="0"',
        ' src="', url, '"',
        ' class="player-loading"',
        ' style="width: 100%; border: none;"></iframe>'
      ].join('');

      $(e).html(iframeTemplate);

      channel = new msgr.Channel(window, $iframe()[0].contentWindow, {enableLogging: false});

      channel.on('dimensionsUpdate', function(data){
        $iframe().height(data.h);
      });

      channel.on('rendered', function() {
        $iframe().removeClass("player-loading");
        $iframe().addClass("player-loaded");
      });

      if (options.forceWidth) {
        $(e).width(options.width ? options.width : "600px");
      }

    }

  }

  this.send = function() {
    var args = Array.prototype.slice.call(arguments);
    channel.send.apply(channel, args);
  };

  this.on = function(name, callback) {
    channel.on(name, callback);
  };

  this.remove = function() {
    channel.remove();
    $iframe().remove();
  };

  this.removeChannel = function() {
    channel.remove();
  };

  this.css = function(key, value){
    $('#' + iframeUid).css(key, value);
  };

  initialize.bind(this)(element, options);
};

module.exports = Instance;
