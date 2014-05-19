angular.module('corespring.wiggi-wiz-features').factory('ImageFeature', [
  'Image',
  'TemplateUtils',
  function(ImageDef, TemplateUtils) {

    var imageSrc = "bbbb.png";
    var csImage = new ImageDef();

    csImage.compile = true;
    csImage.note = 'Corespring Image Override of Image';

    csImage.onClick = function($node, $nodeScope, editor) {
      var buttons = [
        TemplateUtils.makeButton({
          html: '<span>25%</span>'
        }, '0.25'),
        TemplateUtils.makeButton({
          html: '<span>50%</span>'
        }, '0.5'),
        TemplateUtils.makeButton({
          html: '<span>75%</span>'
        }, '0.75'),
        TemplateUtils.makeButton({
          html: '<span>100%</span>'
        }, '1.0'),
        TemplateUtils.makeButton({
          icon: 'fa-align-left'
        }, 'align:left'),
        TemplateUtils.makeButton({
          icon: 'fa-align-right'
        }, 'align:right'),
        TemplateUtils.makeButton({
          icon: 'fa-align-center'
        }, 'align:center')
      ].join('\n');
      editor.togglePopover($node, $nodeScope, buttons, $node.find('img'));
    };


    csImage.initialise = function($node, replaceWith) {
      var html = $node.html();
      var clone = $('<div image-holder>' + html + '</div>');
      return replaceWith(clone);
    };

    csImage.getMarkUp = function($node, $scope) {
      return '<div style="text-align: left;"><img src="' + imageSrc + '"/></div>';
    };


    function getImgNode($node) {
      return $node.find('img');
    }

    csImage.deleteNode = function($node, services) {
      console.log("deleting node: ", $node);
      services.image.deleteFile(getImgNode($node).attr('src'));
      $node.remove();

    };

    csImage.addToEditor = function(editor, addContent) {

      var data = {
        imageUrl: null
      };

      var scopeExtension = {
        imageService: editor.services.image
      };

      function onUpdate(update) {

        if (update.cancelled) {
          editor.services.image.deleteFile(update.imageUrl);
          return;
        }

        if (update.imageUrl) {

          addContent($('<div image-holder="" style="text-align: left;"><img src="' + update.imageUrl + '"/></div>'));
        }
      }

      var dialogTemplate = [
        '<button class="btn btn-small btn-info wiggi-wiz-button" ng-model="data" file-chooser>Choose a file...</button>',
        '<br/>',
        '<div class="alert alert-danger wiggi-wiz-alert" ng-show="error">{{error.message}}</div>',
        '<div class="alert alert-success wiggi-wiz-alert" ng-show="fileName"><strong>You have uploaded:</strong> {{fileName}}</div>'
      ].join('\n');

      editor.launchDialog(data, 'Add Image!', dialogTemplate, onUpdate, scopeExtension);
    };


    return csImage;
  }
]);