/**
 * A class that handles triggering the timeout error.
 * Uses a global array so that it can clear timeouts across player instances.
 */
function TimeoutError(errorCallback, timeout) {
  var errorCodes = require('error-codes');

  window._playerTimeoutErrorIds = window._playerTimeoutErrorIds || [];

  this.arm = function() {

    this.reset();

    if (!isNaN(timeout) && timeout > 0) {
      var id = setTimeout(function() {
        errorCallback(errorCodes.INITIALISATION_FAILED);
      });
      window._playerTimeoutErrorIds.push(id);
    }
  };

  this.disarm = function() {
    this.reset();
  };

  this.reset = function() {
    window._playerTimeoutErrorIds = window._playerTimeoutErrorIds || [];
    window._playerTimeoutErrorIds.forEach(function(id) {
      clearTimeout(id);
    });
    window._playerTimeoutErrorIds = [];
  };
}

/**
 * @constructor
 * @param {node|selector} element - a jquery style selector - aka $(element) will return a jQuery wrapped node.
 * @param {object}  call -  { url: '', method: '', params: {}, hash: ''}
 */
var Instance = function(launchOpts,
                        element,
                        errorCallback,
                        log,
                        autosizeEnabled,
                        iframeScrollingEnabled,
                        timeoutError,
                        scrollContainer) {

  launchOpts = launchOpts || {};

  timeoutError = timeoutError || new TimeoutError(errorCallback, launchOpts.initTimeout);
  timeoutError.reset();

  var call = launchOpts.call;
  var queryParams = launchOpts.queryParams;
  var data = launchOpts.data || {};

  autosizeEnabled = autosizeEnabled !== false;

  log = log || require('logger');

  function PostForm(url) {

    var formName = iframeUid + '-form';

    function addForm() {

      var formParams = [];

      for (var x in data) {

        if (data[x] !== undefined) {

          var d = data[x];

          if (typeof(d) === 'object') {
            d = JSON.stringify(d);
          }

          var p = "<input type='hidden' name=\'" + x + "\' value=\'" + d + "\'></input>";
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

  var scrollingInterval;
  var stopScrolling = function() {
    clearInterval(scrollingInterval);
    scrollingInterval = undefined;
  };
  var keepScrolling = function($scrollable, delta) {
    if (scrollingInterval) {
      stopScrolling();
    }
    scrollingInterval = setInterval(function() {
      var scrollTop = $scrollable.scrollTop();
      $scrollable.scrollTop(scrollTop + delta);
    }, 10);
  };

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

    var iframeClose = '></iframe>';

    $(e).html(iframeOpen + iframeClose);

    if (call.method === 'GET') {
      $(e).find('iframe').attr('src', url);
    } else if (call.method === 'POST') {
      var post = new PostForm(url);
      post.load();
    }

    timeoutError.arm();

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

    channel.on('ready', function() {
      timeoutError.disarm();
      channel.send('initialise', data);
    });

    channel.on('autoScrollStop', function() {
      stopScrolling();
    });
    /**
     * If you want the main window to scroll,
     * send message "autoScroll" with the clientX/Y position
     * of the dragged element.
     */
    channel.on('autoScroll', function(clientPos) {
      var scrollAmount = 5;
      var sensitiveAreaHeight = 50;
      var scrollContainerElement = (scrollContainer || {}).element;
      var scrollContainerTop = (scrollContainer || {}).top;
      var iframeRelativeTop = scrollContainerTop || (scrollContainerElement ? 0 : $iframe().position().top);

      var sc = scrollContainerElement || 'body';
      var $scrollable = $(sc);
      if ($scrollable.length === 0) {
        // no scroll container found
        return;
      }
      var scrollTop = $scrollable.scrollTop();
      var viewportTop = 0;
      var viewportBottom = Math.min(window.innerHeight, $scrollable.height());
      var y = clientPos.y - scrollTop + iframeRelativeTop;
      if (y < viewportTop + sensitiveAreaHeight) {
        keepScrolling($scrollable, -scrollAmount);
      } else if (y > viewportBottom - sensitiveAreaHeight) {
        keepScrolling($scrollable, scrollAmount);
      } else {
        stopScrolling();
      }
    });

    channel.on('getScrollPosition', function(err, callback) {
      var $scrollable = $('.item-iframe-container');
      if ($scrollable.length === 0) {
        $scrollable = $('body');
      }
      var scrollTop = $scrollable.scrollTop();
      callback(null, {top: scrollTop});
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
    timeoutError.reset();
    channel.remove();
    $iframe().remove();
  };

  this.removeChannel = function() {
    timeout.reset();
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