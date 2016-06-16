angular.module('corespring-editing.wiggi-wiz-features.cs-image')
  .factory('ImageFeature', [
    '$document',
  'Image',
  'TemplateUtils',
  'QueryParamUtils',
  function($document, ImageDef, TemplateUtils, QueryParamUtils) {

    var csImage = new ImageDef();

    csImage.compile = true;
    csImage.note = 'Corespring Image Override of Image';

    csImage.getImgNode = function($node) {
      return $($node).find('img');
    };

    csImage.onClick = undefined;

    csImage.onMouseUp = function($node, $nodeScope, editor) {
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
          icon: 'fa-align-center'
        }, 'align:center'),
          TemplateUtils.makeButton({
          icon: 'fa-align-right'
        }, 'align:right')
        ].join('\n');

      editor.togglePopover($node, $nodeScope, buttons, $node.find('img'));
    };

    csImage.initialise = function($node, replaceWith) {
      var imageSrc = $node.find('img').attr('src');

      if (imageSrc) {
        imageSrc = QueryParamUtils.addQueryParams(imageSrc);
        var divStyle = $node.attr('style');
        var imageStyle = $node.find('img').attr('style') || '';
        var clone = $('<div style="' + divStyle + '" image-holder image-src="' + imageSrc + '" image-style="' + imageStyle + '"></div>');
        return replaceWith(clone);
      } else {
        return $node;
      }
    };

    csImage.changeSrcPath = function(path){
      return QueryParamUtils.addQueryParams(path);
    };

    csImage.getMarkUp = function($node, $scope) {
      var imgNode = $node.find('img');
      var divStyle = $node.attr('style') || '';
      var imageStyle = imgNode.attr('style') || '';
      //strip the query params
      var src = (imgNode.attr('src') || '').split('?')[0];
      return '<div style="' + divStyle + '"><img style="' + imageStyle + '" src="'+ src + '"></img></div>';
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
          if (update.imageUrl) {
            editor.services.image.deleteFile(update.imageUrl);
          }
          return;
        }

        if (update.imageUrl) {
          var img = '<div image-holder="" image-src="' + update.imageUrl + '" style="text-align: left;"></div>';
          addContent($(img));
        }
      }

      var dialogTemplate = [
        '<div class="file-upload-modal" ng-mousedown="$event.stopPropagation()" ng-mouseup="$event.stopPropagation()">',
        '  <div class="alert alert-danger wiggi-wiz-alert ng-hide" ng-show="error"  ng-bind="error"></div>',
        '  <div class="alert alert-success wiggi-wiz-alert ng-hide" ng-show="fileName"><strong>Upload successful.</strong><br/>You have successfully uploaded: {{fileName}}</div>',
        '  <div class="center-container">',
        '    <div class="info">',
        '       <span>Upload a .png, .gif, or .jpeg image (maximum size is 500kb).</span>',
        '    </div>',
        '    <div class="button-row-top">',
        '      <button ng-show="status == \'initial\' || status == \'failed\'" class="btn btn-primary upload-button" ng-model="data" file-chooser=""><span class="upload-icon"><i class="fa fa-upload"></i></span>Upload Image</button>',
        '      <button ng-show="status == \'failed\'" class="btn btn-default" ng-click="cancel()">Cancel</button>',
        '    </div>',
        '    <div ng-if="status == \'started\'">',
        '      <div class="uploading-label">Uploading image {{percentProgress}}%</div>',
        '      <progressbar value="percentProgress" class="progress-striped"></progressbar>',
        '    </div>',
        '    <div ng-if="status !== \'completed\' && status !== \'failed\'">',
        '      <button class="btn btn-default" ng-click="cancel()">Cancel</button>',
        '    </div>',
        '  </div>',
        '  <div class="center-container" ng-if="status == \'completed\'">',
        '    <button class="btn btn-primary" ng-click="ok()">Insert</button>',
        '    <button class="btn btn-default" ng-click="cancel()">Cancel</button>',
        '  </div>',
        '</div>'
      ].join('\n');

      editor.launchDialog(data, '', dialogTemplate, onUpdate, scopeExtension, {
        omitHeader: true,
        omitFooter: true
      });
    };

    return csImage;
  }
]);