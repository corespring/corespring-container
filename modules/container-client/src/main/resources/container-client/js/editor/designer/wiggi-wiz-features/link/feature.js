angular.module('corespring.wiggi-wiz-features.link').factory('WiggiLinkFeatureDef', [ '$compile', '$timeout',

  function($compile, $timeout) {

    function getLink(model) {
      return [
        '<a href="',
        model.url,
        '">',
        (_.isEmpty(model.text) ? model.url : model.text),
        '</a>'
      ].join("");
    }

    function FeatureDef() {
      this.name = 'a';
      this.tag = 'a';
      this.draggable = true;
      this.iconclass = 'fa fa-link';
      this.compile = true;

      var dialogTemplate = [
        '<label>Link: <input type="text" ng-model="data.url" /></label>',
        '<label>Text: <input type="text" ng-model="data.text" /></label>'
      ].join('\n');

      var scopeExtension = {};

      this.initialise = function($node, replaceWith) {
        var content = $node.clone().wrap('<div/>').parent().html();
        var newNode = $('<div link-holder>' + content + '</div>');
        return replaceWith(newNode);
      };

      this.editNode = function($node, $scope, editor) {
        var $a = $('.holder a', $node);

        var onUpdate = function(update) {
          var newNode = $(getLink(update));
          $node.html(newNode);
          $compile($node)($scope);
        };

        editor.launchDialog({
          url: $a.attr('href'),
          text: $a.text()
        }, 'Add Link', dialogTemplate, onUpdate, scopeExtension);
      };

      this.addToEditor = function(editor, addContent) {
        var text = editor.getCurrentRange() !== undefined ? $(editor.getCurrentRange().cloneContents().cloneNode(true)).text() : '';
        var hasRange = !_.isEmpty(text);

        var onUpdate = function(update) {
          if (hasRange) {
            editor.wrapSelection('delete', null);
          }
          // A document.execCommand('delete') has a bit of a lag
          $timeout(function() {
            addContent($(getLink(update)));
          });
        };

        editor.launchDialog({text: text, url: ""}, 'Add Link', dialogTemplate, onUpdate, scopeExtension);
      };

      this.getMarkUp = function($node, $scope) {
        return $('.holder', $node).html();
      };


    }
    return FeatureDef;
  }
]);