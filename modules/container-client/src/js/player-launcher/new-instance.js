/**
 * @param call: { url: '', method: '', params: {}, hash: ''}
 */
var Instance = function(call,  element, errorCallback, log) {
  log.info('--> new instance');
  log.info('call', call);

  /* global msgr */
  /** msgr.Channel */
  var channel;
  var iframeUid = 'corespring-iframe-' + msgr.utils.getUid();
  var errors = require('errors');

  function $iframe() {
    var $node = $('#' + iframeUid);
    if($node.size() !== 1){
      var err = errors.CANT_FIND_IFRAME(iframeUid);
      errorCallback(err);
    }
    return $node;
  }

  function initialize(e) {
    if (!call || !call.url) {
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

    function makeUrl() {
      var Builder = require('url-builder');
      return new Builder().build(call.url, call.params);
    }

    var url = makeUrl();

    if(call.hash){
      url += '#' + call.hash;
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
  }

  initialize.bind(this)(element);

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

  this.width = function(w){
    $('#' + iframeUid).width(w);
  };

  this.css = function(key, value){
    $('#' + iframeUid).css(key, value);
  };

};

 module.exports = Instance;
