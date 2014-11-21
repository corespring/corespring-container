$(function() {

  $('#mainTabNav a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  });

  //This replaces the drop-down selection to
  //show what was selected
  $('.dropdown a').on('click',function(e){
    e.preventDefault();
    var thisItem = $(this).text();
    $(this).parent().parent().siblings('button').html(thisItem+' <span class="caret"></span>');
  });

  //************ ACTIONS **************************//
  //nav-new
  $('#nav-new').on('click',function(e){
    window.open('des-12.html','_newtab');
  });

  //file rename modal
  $('.title-nav').on('click',function(){
   $('#renameQuestion').modal('toggle');
   $('#renameQuestion #itemName span').html($(this).text());
  });

  //save file rename
  $('#renameQuestion #save').on('click',function(){
    console.debug($('#renameQuestion #itemName span').val());
    $('#renameQuestion').modal('hide');
    $('.title-nav').text($('#renameQuestion #itemName span').text());
  });

  //open file modal
  $('#nav-open').on('click',function(){
   $('#openFileModal').modal('toggle');
  });

  //copy file modal
  $('#nav-copy').on('click',function(){
   $('#copyFileModal').modal('toggle');
  });

  //delete file modal
  $('#nav-delete').on('click',function(){
   $('#deleteFileModal').modal('toggle');
  });

  //archive file modal
  $('#nav-archive').on('click',function(){
   $('#archiveFileModal').modal('toggle');
  });


  
  //************** DESIGN/EDIT QUESTION VIEW *************************//

  $('.configWrapper .close').on('click',function(){
   $('.configWrapper').fadeOut('fast');
   $('.wiggi-wiz-toolbar button').removeAttr('disabled');
  });


  $('#btn-shortanswer').on('click',function(e){
    e.preventDefault();

    $('.content').css('display', 'none');
    $( '.editPreviewWrapper' ).fadeIn('slow');

    //preview button
      if($('#btnEditPreview').hasClass('active')){
      } else {
        $('#btnEditPreview').toggleClass('active');
        $('#btnEditPreview').toggleClass('btn-warning');
      }

      if($('#btnEditPreview').hasClass('active')){
        $('#btnEditPreview').html('Close Preview  <i class="fa fa-toggle-right"></i>');
      } else {
        $('#btnEditPreview').html('Preview  <i class="fa fa-toggle-left"></i>');
      }

      $('.wiggi-wiz-toolbar button').attr('disabled','disabled');

    $('#shortAnswerDialog').dialog({
      width: 'auto',
      height: 'auto',
      closeText: 'x',
        close:function(){
          $('.wiggi-wiz-toolbar button').removeAttr('disabled');
        },
      position:{
        my: 'left+40',
        at: 'left bottom'
      }
    });
  });


  $('#btn-config').on('click',function(e){
    e.preventDefault();

    $('.wiggi-wiz-toolbar button').attr('disabled','disabled');

    $('#shortAnswerDialog').dialog({
      width: 'auto',
      height: 'auto',
      closeText: 'x',
        close:function(){
          $('.wiggi-wiz-toolbar button').removeAttr('disabled');
        }
    });
  });

  $('.shortAnswerConfigPanel .close').on('click',function(){
    console.debug('shortAnswerConfigPanel');
   $( '.shortAnswerConfigPanel' ).css('left','50');
   $('.shortAnswerConfigPanel').fadeOut('fast');
   $('.wiggi-wiz-toolbar button').removeAttr('disabled');
  });

  $('#btn-scoring').click(function(e){
    if($('#btnEditPreview').hasClass('active')){
      $('#btnEditPreview').html('Preview  <i class="fa fa-toggle-left"></i>');
      $('#btnEditPreview').toggleClass('active');
      $('#btnEditPreview').toggleClass('btn-warning');
    } else {
      
    }
    $('.shortAnswerConfigPanel, .configWrapper').fadeOut('fast');
    $('#scoringModal').modal('toggle');
    $('#editPreview').closeMbExtruder();
  });

  //************* SUPPORTING MATERIALS ************//
  
  //add supporting materials modal
  $('#btn-add-supporting-materials').on('click',function(){
   $('#addSupportingMaterial').modal('toggle');
  });

  //nav-filename1
  $('.nav-filename1').on('click',function(e){
    $('.content').css('display', 'none');
    $( '#filename1' ).fadeIn('slow');
  });

  //nav-filename2
  $('.nav-filename2').on('click',function(e){
    $('.content').css('display', 'none');
    $( '#filename2' ).fadeIn('slow');
  });

  //nav-filename3
  $('.nav-filename3').on('click',function(e){
    $('.content').css('display', 'none');
    $( '#filename3' ).fadeIn('slow');
  });

  //nav-filename4
  $('.nav-filename4').on('click',function(e){
    $('.content').css('display', 'none');
    $( '#filename4' ).fadeIn('slow');
  });

  //***************** HELP ***************************/
  //help dialog
  $('.help').on('click',function(e){
    e.preventDefault();
    $('#helpDialog').dialog({
      show: {
        effect: "fadeIn",
        duration: 500
      },
      hide:{
        effect: "fadeOut",
        duration: 500
      },
      width: 800,
      height: 600,
      closeText: 'x'
    });
  });
  
  $('.catalog-view').click(function(e){
    e.preventDefault();
    $('#catalog-view').modal('toggle');
  });
  

  //***************** PREVIEW PANELS *****************/

  //edit preview panel
  

  // buildEditPreviewPanel();
  $('#btnEditPreview').click(function(e){

    $(this).toggleClass('active');
    $(this).toggleClass('btn-warning');
    if($(this).hasClass('active')){

    $('.content').css('display', 'none');
    $( '.editPreviewWrapper' ).fadeIn('slow');

      $(this).html('Close Preview  <i class="fa fa-toggle-right"></i>');
    } else {
      $( '.editPreviewWrapper' ).fadeOut('slow');
      $(this).html('Preview Question <i class="fa fa-toggle-right"></i>');
    }
  });

  $('#btnEditPreview2').click(function(e){
    $('#editPreviewDialog').dialog({
      width: 'auto',
      height: 'auto',
      closeText: 'x',
      open:function(){
        console.debug(this);
        $('.ui-dialog-titlebar').css('background','none');
        $('.ui-widget-header').css('border','none');
        $(this).blur(function(){
          console.debug('click');
          $(this).dialog('close');
        })
      },
      close: function(){
        $(this).unbind();
      }
    });
  });
  

  $('#btnPreviewProfile').click(function(e){
    $('.profileInformationPreviewWrapper').fadeIn('slow');
    $(this).toggleClass('active');
    $(this).toggleClass('btn-warning');
    if($(this).hasClass('active')){
      $('.profileInformationPreviewWrapper').fadeIn('slow');
      $(this).html('Close Preview  <i class="fa fa-toggle-right"></i>');  
    } else {
      $('.profileInformationPreviewWrapper').fadeOut('slow');
      $(this).html('Preview Profile Information  <i class="fa fa-toggle-right"></i>');
    }
  });
  
  //***************** ALLOWS DIVS TO BE EDITABLE *************//
  $('.editable').each(function(){
    this.contentEditable = true;
  });
  $('.editable').click(function(){
    $('.saveMessaging').text('Updating...');
    $('.saveMessaging').text('Changes saved');
  });


  //********* SHOW HIDE SCORE IN EDIT PREVIEW ********//
  $('.editPreviewWrapper .btn-submit').click(function(e){
      $('.scoreWrapper').fadeIn('slow');
      $('.editPreviewWrapper .btn-reset').removeAttr("disabled");
      $('.editPreviewWrapper .btn-submit').attr("disabled","disabled");
  });

  $('.editPreviewWrapper .btn-reset').click(function(e){
      $('.scoreWrapper').fadeOut('slow');
      $('.editPreviewWrapper .btn-reset').attr("disabled","disabled");
      $('.editPreviewWrapper .btn-submit').removeAttr("disabled");
  });

});