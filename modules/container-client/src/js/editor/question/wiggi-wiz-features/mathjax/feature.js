angular.module('corespring.wiggi-wiz-features.mathjax').factory('WiggiMathJaxFeatureDef', ['MathJaxService',
  '$rootScope',

  function(MathJaxService, $rootScope) {

    function FeatureDef() {
      var name = 'mathjax';

      function dialog(editor, callback, $scope) {
        editor.launchDialog({ originalMarkup: $scope ? ($scope.originalMarkup || '') : ''},
          'Math Symbols and Equations',
          '<mathjax-dialog ng-model="data.originalMarkup"></mathjax-dialog>',
          callback,
          {},
          {featureName: name}
        );
      }

      this.name = name;
      this.attributeName = 'mathjax';
      this.draggable = true;
      this.iconclass = 'fa math-sum';
      this.compile = true;

      this.initialise = function($node, replaceWith) {
        var content = $node.html();
        var newNode = $('<div mathjax-holder contenteditable="false">');
        newNode.html(content);
        MathJaxService.parseDomForMath(100);
        return replaceWith(newNode);
      };

      this.addToEditor = function(editor, addContent) {
        dialog(editor, function(update) {
          var $node;
          if (!update.cancelled) {
            $node = $('<mathjax-holder></mathjax-holder>');
            $node.html(update.originalMarkup);
            addContent($node);
          }
          $rootScope.$emit('math-updated');
        });
      };

      this.onClick = function($node, $scope, editor) {
        dialog(editor, function(update) {
          if (!update.cancelled) {
            $scope.originalMarkup = update.originalMarkup;
            $scope.$emit('save-data');
            MathJaxService.parseDomForMath(100);
          }
          $scope.$emit('math-updated');
        }, $scope);
      };

      this.getMarkUp = function($node, $scope) {
        return '<span mathjax>' + $scope.originalMarkup + '</span>';
      };
    }
    return FeatureDef;
  }
]);
