angular.module('corespring.wiggi-wiz-features.mathjax').factory('WiggiMathJaxFeatureDef', ['MathJaxService',

  function(MathJaxService) {

    function FeatureDef() {
      this.name = 'mathjax';
      this.attributeName = 'mathjax';
      this.draggable = true;
      this.iconclass = 'fa math-sum';
      this.addToEditor = '<div mathjax-holder></div>';
      this.compile = true;

      this.initialise = function($node, replaceWith) {
        var content = $node.html();
        var newNode = $('<div mathjax-holder contenteditable="false">');
        newNode.html(content);
        MathJaxService.parseDomForMath(100);
        return replaceWith(newNode);
      };

      this.editNode = function($node, $scope, editor) {

        editor.showEditPane($scope,
          'Edit the Math',
          '<mathjax-dialog ng-model="data.originalMarkup"></mathjax-dialog>',
          function onUpdate() {},
          null,
          function onClose() {
            $scope.$emit('save-data');
            MathJaxService.parseDomForMath(100);
          }
        );
      };

      this.getMarkUp = function($node, $scope) {
        return '<span mathjax>' + $scope.originalMarkup + '</span>';
      };
    }
    return FeatureDef;
  }
]);