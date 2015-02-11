angular.module('corespring.wiggi-wiz-features.mathjax').factory('WiggiMathJaxFeatureDef', ['MathJaxService', '$timeout',

  function(MathJaxService, $timeout) {

    function FeatureDef() {
      this.name = 'mathjax';
      this.attributeName = 'mathjax';
      this.draggable = true;
      this.iconclass = 'fa math-sum';
      this.addToEditor = function(editor, addContent) {
        addContent($('<div mathjax-holder></div>'));
      };

      this.compile = true;

      this.initialise = function($node, replaceWith) {
        var content = $node.html();
        var newNode = $('<div mathjax-holder contenteditable="false">');
        newNode.html(content);
        MathJaxService.parseDomForMath(100);
        return replaceWith(newNode);
      };

      this.onClick = function($node, $scope, editor) {
        editor.launchDialog({ originalMarkup: $scope.originalMarkup || '' },
          'Math',
          '<mathjax-dialog ng-model="data.originalMarkup"></mathjax-dialog>',
          function onUpdate(update) {
            if(!update.cancelled) {
              $scope.originalMarkup = update.originalMarkup;
              $scope.$emit('save-data');
              MathJaxService.parseDomForMath(100);
            }
          },
          {},
          {featureName: this.name}
        );
      };

      this.getMarkUp = function($node, $scope) {
        return '<span mathjax>' + $scope.originalMarkup + '</span>';
      };
    }
    return FeatureDef;
  }
]);
