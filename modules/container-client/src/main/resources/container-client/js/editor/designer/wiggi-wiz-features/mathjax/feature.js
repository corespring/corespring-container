angular.module('corespring.wiggi-wiz-features').factory('WiggiMathJaxFeatureDef', [

  function() {

    function FeatureDef() {
      this.name = 'mathjax';
      this.attributeName = 'mathjax';
      this.draggable = true;
      this.iconclass = 'fa math-sum';
      this.addToEditor = '<div mathjax-holder></div>';
      this.compile = true;

      this.initialise = function($node, replaceWith) {
        var content = $node.html();
        var newNode = $('<div mathjax-holder>');
        newNode.html(content);
        return replaceWith(newNode);
      };

      this.onDblClick = function($node, $scope, editor) {

        editor.showEditPane($scope,
          'Edit the Math',
          '<mathjax-dialog ng-model="data.originalMarkup"></mathjax-dialog>',
          function onUpdate() {},
          null,
          function onClose() {
            $scope.$emit('save-data');
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