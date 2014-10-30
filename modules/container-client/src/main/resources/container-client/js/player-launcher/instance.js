var Instance = function(element, options, errorCallback, log) {

  var dispatcher, receiver;

  var errors = require("errors");

  var that = this;

  log = log || {
    error: function(s) {
      console.error(s);
    },
    warn: function(s) {
      console.warn(s);
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

    /* global msgr */
    dispatcher = new msgr.Dispatcher(window, $('#iframe-player')[0].contentWindow, {enableLogging: true});
    receiver = new msgr.Receiver(window, $('#iframe-player')[0].contentWindow);

    if (options.forceWidth) {
      $(e).width(options.width ? options.width : "600px");
    }

    that.addListener("rendered", function(data) {
      $('#iframe-player')[0].removeClass("player-loading");
      $('#iframe-player')[0].addClass("player-loaded");
    });


    //dimensionChangeListener(e);

    $(element).parent().bind('DOMNodeRemoved', function(e) {
      if ('#' + e.target.id === element) {
        this.remove();
      }
    });
  }

  this.send = function() {
    dispatcher.send.apply(Array.prototype.slice(arguments, 0));
  };

  this.addListener = function(name, callback) {
    receiver.on(name, callback);
  };

  this.remove = function() {
    dispatcher.remove();
    receiver.remove();
    $(element).remove();
  };


  initialize(element, options);
};

module.exports = Instance;
