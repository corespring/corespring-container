$(document).ready(function() {
  var playerHolderWidth = 600;
  var holder = $('.holder');
  var colors = [
      'correct-background',
      'correct-foreground',
      'partially-correct-background',
      'incorrect-background',
      'incorrect-foreground',
      'hide-show-background',
      'hide-show-foreground',
      'warning-background',
      'warning-foreground',
      'warning-block-background',
      'warning-block-foreground'
  ];
  var colorsHolder= $('.colors-holder');

  var colorsHtml = '<table>';
  // _.each(colors, function(c) {
  //    colorsHtml += '<th>'+c+'</th>';
  // });
  // colorsHtml += '</tr><tr>';
  _.each(colors, function(c) {
     colorsHtml += '<tr><td>'+c+'</td><td><input placeholder="default" class="color-input '+c+'" type="text"></td></tr>';
  });
  colorsHtml += '</table>';
  colorsHolder.prepend(colorsHtml);

  console.log('opts: ', opts);

  opts.onPlayerRendered = function() {
    console.log('onPlayerRendered', arguments);
  };

  var player;

  function addPlayer() {
    if (player) {
      player.remove();
    }
    var playerWidth = $('#player-width-input').val();
    opts.width = playerWidth.length > 0 ? playerWidth + 'px' : undefined;
    opts.customVariables = {colors: {}, iconSet: 'check'};
    for (var i = 0; i < colors.length; i++) {
      var v = $('.' + colors[i]).spectrum('get');
      if (v && !v.selector) {
        if (v && v.toHexString) v = v.toHexString();
        opts.customVariables.colors[colors[i]] = v;
      }
    }
    opts.customVariables.iconSet = $('input[name=iconset]:checked').val() || 'check';
    player = new org.corespring.players.ItemPlayer(holder, opts, function(err) {
      console.warn(err);
    });
  }

  addPlayer();

  $('#colors-toggle').click(function() {
    var div = $('.colors');
    if (div.is(':visible')) {
      div.hide();
    } else {
      div.show();
    }
  });


  $('#set-mode-evaluate').click(function() {
    player.setMode('evaluate', function(err) {
      console.log(err);
    });
  });

  $('#set-mode-instructor').click(function() {
    player.setMode('instructor', function(err) {
      console.log(err);
    });
  });

  $('#player-container-width-input').change(function() {
    $('.holder').css('width', $('#player-container-width-input').val() + "px");
  });

  $('.color-input').spectrum({
    allowEmpty: true,
    showInput: true
  });

  $('.reload').click(function() {
    addPlayer();
  });


  $('#player-container-width-input').val(playerHolderWidth);
  $('.holder').css('width', playerHolderWidth + "px");

});