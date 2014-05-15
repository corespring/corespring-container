angular.module('corespring.wiggi-wiz-features').factory('ImageFeature', ['Image',

  function(ImageDef) {

    var imageSrc = "bbbb.png";
    var csImage = new ImageDef();

    csImage.compile = true;

    csImage.initialise = function($node, replaceWith) {
      var html = $node.html();
      var clone = $("<div image-holder>" + html + "</div>");
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