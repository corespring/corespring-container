/**
 * @param call: { url: '', method: '', params: {}, hash: ''}
 */

var Instance = function(call,  element, errorCallback, log, autosizeEnabled, iframeScrollingEnabled) {

  autosizeEnabled = autosizeEnabled !== false;

  log = log || require('logger');

  function PostForm(url){

    var formName = iframeUid + '-form';

    function addForm(){
      var form = [
        '<form ',
        '  target="', iframeUid, '"',
        '  id="', formName, '"',
        '  name="', formName, '"',
        '  method="POST" ',
        '  action="', url, '">',
        '</form>'
      ].join('');

      $('body').append(form);
    }

    function submitForm(){
      var form = document.forms[formName];
      form.submit();
    }

    function removeForm(){
      $('#' + formName).remove();
    }

    this.load = function(){
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
    if($node.size() !== 1){
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
      return new Builder(call.url).params(call.params).build();
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

    var iframeOpen = [
      '<iframe',
      ' id="', iframeUid , '"',
      ' name="', iframeUid ,'"',
      ' frameborder="0"',
      iframeScrollingEnabled ? '' : ' scrolling="no"',
      ' class="player-loading"',
      ' style="border:none;' + (autosizeEnabled ? ' width:100%;' : '') + '" '
    ].join('');

    if(call.method === 'GET'){
      iframeOpen += 'src="'+url+'"';
    }

    var iframeClose = '></iframe>';

    $(e).html(iframeOpen + iframeClose);


    if(call.method === 'POST'){
      var post = new PostForm(url);
      post.load();
    }

    channel = new msgr.Channel(window, $iframe()[0].contentWindow, {enableLogging: false});

    if(autosizeEnabled){
      channel.on('dimensionsUpdate', function(data){
        $iframe().height(data.h);
      });
    }

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
