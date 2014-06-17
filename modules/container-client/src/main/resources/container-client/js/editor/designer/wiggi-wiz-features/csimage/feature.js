angular.module('corespring.wiggi-wiz-features.cs-image').factory('ImageFeature', [
  'Image',
  'TemplateUtils',
  function(ImageDef, TemplateUtils) {

    var csImage = new ImageDef();

    csImage.compile = true;
    csImage.note = 'Corespring Image Override of Image';

    csImage.getImgNode = function($node) {
      return $($node).find('img');
    };

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
      var imageSrc = $node.find('img').attr('src');

      if (imageSrc) {
        var divStyle = $node.attr('style');
        var imageStyle = $node.find('img').attr('style');
        var clone = $('<div style="'+divStyle+'" image-holder image-src="' + imageSrc + '" image-style="' + imageStyle + '"></div>');
        return replaceWith(clone);
      } else {
        return $node;
      }
    };

    csImage.getMarkUp = function($node, $scope) {
      var imgNode = $node.find('img');
      var divStyle = $node.attr('style');
      return '<div style="' + divStyle + '">' + $(imgNode)[0].outerHTML + '</div>';
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
          console.log("Adding Image: ", update.imageUrl);
          var img = '<div image-holder="" image-src="' + update.imageUrl + '" style="text-align: left;"></div>';
          console.log(img);
          addContent($(img));
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