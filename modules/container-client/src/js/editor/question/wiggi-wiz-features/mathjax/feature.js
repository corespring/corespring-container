angular.module('corespring.wiggi-wiz-features.mathjax').factory('WiggiMathJaxFeatureDef', [
  'MathJaxService',
  'MathFormatUtils',
  '$rootScope', 
  '$log',

  function(MathJaxService, MathFormatUtils, $rootScope, $log) {

    function FeatureDef() {
      var name = 'mathjax';

      function dialog(editor, callback, $scope) {
        editor.launchDialog({
            originalMarkup: $scope ? ($scope.originalMarkup || '') : ''
          },
          'Mathematical Notation',
          '<mathjax-dialog ng-model="data.originalMarkup"></mathjax-dialog>',
          callback, {}, {
            featureName: name
          }
        );
      }

      this.name = name;
      this.attributeName = 'mathjax';
      this.insertInline = function($node){
        var info = MathFormatUtils.getMathInfo($node.html());
        return info && info.displayMode === 'inline'; 
      };

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
          $scope.originalMarkup = update.originalMarkup;
          $scope.$emit('save-data');
          MathJaxService.parseDomForMath(100);
          $scope.$emit('math-updated');
        }, $scope);
      };

      this.getMarkUp = function($node, $scope) {
        if (!$scope) {
          $log.warn('[mathjax-feature].getMarkUp: Parameter $scope no set.');
        }
        if (!$scope.originalMarkup) {
          $log.warn('[mathjax-feature].getMarkUp: $scope.originalMarkup not set.');
        }
        var markup = $scope ? $scope.originalMarkup : '';
        return '<span mathjax>' + markup + '</span>';
      };
    }
    return FeatureDef;
  }
]);