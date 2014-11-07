var Instance = function(element, options, errorCallback, log) {

  /* global msgr */
  /** msgr.Channel */
  var channel;

  var errors = require("errors");

  log = log || {
    error: function(s) {
      if(window.console) {
        console.error(s);
      }
    },
    warn: function(s) {
      if(window.console){
        console.warn(s);
      }
    }
  };

  function initialize(e, options) {
    if (!options || !options.url) {
      errorCallback({
        code: 999,
        message: "No url specified"
      });
      return;
    }

    if ($(e).length === 0) {
      errorCallback(errors.CANT_FIND_IFRAME);
      return;
    }

    function makeUrl(url, queryParams) {
      var Builder = require('url-builder');
      return new Builder().build(url, queryParams);
    }

    var url = makeUrl(options.url, options.queryParams);
    if (options.showPreview === true) {
      url += "#/?showPreviewButton";
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

    var iframeTemplate = [
      "<iframe",
      " id='iframe-player'",
      " frameborder='0'",
      " src='",
      url,
      "'",
      " class='player-loading'",
      " style='",
      "   width: 100%;",
      "   border: none;",
      " '",
      "></iframe>"
    ].join('');

    $(e).html(iframeTemplate);

    channel = new msgr.Channel(window, $('#iframe-player')[0].contentWindow, {enableLogging: true});

    channel.on('dimensionsUpdate', function(data){
      $('#iframe-player').height(data.h);
    });

    channel.on('rendered', function() {
      $('#iframe-player').removeClass("player-loading");
      $('#iframe-player').addClass("player-loaded");
    });

    if (options.forceWidth) {
      $(e).width(options.width ? options.width : "600px");
    }

    $(element).parent().bind('DOMNodeRemoved', function(e) {
      if ('#' + e.target.id === element) {
        this.remove();
      }
    });
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
    $(element).remove();
  };


  initialize(element, options);
};

module.exports = Instance;
