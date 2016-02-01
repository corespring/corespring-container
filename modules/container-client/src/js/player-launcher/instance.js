/**
 * @param call: { url: '', method: '', params: {}, hash: ''}
 */

var Instance = function(launchOpts, element, errorCallback, log, autosizeEnabled, iframeScrollingEnabled) {

  var call = launchOpts.call;
  var queryParams = launchOpts.queryParams;
  var data = launchOpts.data || {};

  autosizeEnabled = autosizeEnabled !== false;

  log = log || require('logger');

  function PostForm(url) {

    var formName = iframeUid + '-form';

    function addForm() {

      var formParams = [];
      
      for(var x in data){

        if(data[x] !== undefined){

          var d = data[x];
          
          if(typeof(d) === 'object'){
            d = JSON.stringify(d);
          } 

          var p = '<input type="hidden" name="'+x+'" value="'+d+'"></input>';
          formParams.push(p);
        }
      }

      var form = [
        '<form ',
        '  target="', iframeUid, '"',
        '  id="', formName, '"',
        '  name="', formName, '"',
        '  method="POST" ',
        '  action="', url, '">',
        formParams.join(''),
        '</form>'
      ].join('');

      $('body').append(form);
    }

    function submitForm() {
      var form = document.forms[formName];
      form.submit();
    }

    function removeForm() {
      $('#' + formName).remove();
    }

    this.load = function() {
      addForm();
      submitForm();
      removeForm();
    };
  }

  /* global msgr */
  /** msgr.Channel */
  var channel;
  var iframeUid = 'corespring-iframe-' + msgr.utils.getUid();
  var errorCodes = require('error-codes');

  function $iframe() {
    var $node = $('#' + iframeUid);
    if ($node.size() !== 1) {
      var err = errorCodes.CANT_FIND_IFRAME(iframeUid);
      errorCallback(err);
    }
    return $node;
  }

  function initialize(e) {
    if (!call || !call.url) {
      errorCallback(errorCodes.NO_URL_SPECIFIED);
      return;
    }

    if ($(e).length === 0) {
      errorCallback(errorCodes.CANT_FIND_CONTAINER_FOR_PLAYER);
      return;
    }

    function makeUrl() {
      var Builder = require('url-builder');
      return new Builder(call.url).params(queryParams).build();
    }

    var url = makeUrl();

    if (call.hash) {
      url += '#' + call.hash;
    }

    var iframeStyles = [
      '',
      '.player-loading{visibility: hidden; position: absolute;}',
      '.player-loaded{visibility: visible; position: initial;}'
    ].join('\n');

    // This is a workaround for IE* because $(iframe).css("absolute","initial") is not working
    (function injectPlayerStyles() {
      if ($('head #playerstyle').length === 0) {
        $('head').append('<style id="playerstyle" type="text/css">' + iframeStyles + '</style>');
      }
    })();

    var iframeOpen = [
      '<iframe',
      ' id="', iframeUid, '"',
      ' name="', iframeUid, '"',
      ' frameborder="0"',
      iframeScrollingEnabled ? '' : ' scrolling="no"',
      ' class="player-loading"',
      ' style="border:none;' + (autosizeEnabled ? ' width:100%;' : '') + '" '
    ].join('');

    if (call.method === 'GET') {
      iframeOpen += 'src="' + url + '"';
    }

    var iframeClose = '></iframe>';

    $(e).html(iframeOpen + iframeClose);


    if (call.method === 'POST') {
      var post = new PostForm(url);
      post.load();
    }

    channel = new msgr.Channel(window, $iframe()[0].contentWindow, {
      enableLogging: false
    });

    if (autosizeEnabled) {
      channel.on('dimensionsUpdate', function(data) {
        $iframe().height(data.h);
      });
    }

    channel.on('rendered', function() {
      $iframe().removeClass("player-loading");
      $iframe().addClass("player-loaded");
    });

    channel.on('ready', function(){
      channel.send('initialise', data);
    });

    /**
     * If you want the main window to scroll,
     * send message "autoScroll" with the clientX/Y position
     * of the dragged element.
     */
    channel.on('autoScroll', function(clientPos) {
      var scrollAmount = 5;
      var sensitiveAreaHeight = 200;

      var $scrollable = $('.item-iframe-container');
      if($scrollable.length === 0){

        $scrollable = $('body');
      }
      var scrollTop = $scrollable.scrollTop();
      var viewportTop = 0;
      var viewportBottom = $scrollable.height();
      var y = clientPos.y - scrollTop;
      if (y < viewportTop + sensitiveAreaHeight) {
        $scrollable.scrollTop(scrollTop - scrollAmount);
      } else if (y > viewportBottom - sensitiveAreaHeight) {
        $scrollable.scrollTop(scrollTop + scrollAmount);
      }
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

  this.width = function(w) {
    $('#' + iframeUid).width(w);
  };

  this.css = function(key, value) {
    $('#' + iframeUid).css(key, value);
  };

};

module.exports = Instance;