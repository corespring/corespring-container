angular.module('corespring.wiggi-wiz-features').factory('WiggiMathJaxFeatureDef', [

  function() {

    function FeatureDef() {
      this.name = 'mathjax';
      this.attributeName = 'mathjax';
      this.iconclass = 'fa math-sum';
      this.addToEditor = '<div mathjax-holder><math><msup><mi>r</mi><mn>3</mn></msup><math></div>';
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
          '<mathjax-dialog></mathjax-dialog>',
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