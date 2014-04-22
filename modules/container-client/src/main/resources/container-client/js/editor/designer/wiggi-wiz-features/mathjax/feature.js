angular.module('corespring.wiggi-wiz-features').factory('WiggiMathJaxFeatureDef', [

  function() {

    function FeatureDef() {
      this.name = 'mathjax';
      this.tagName = 'math';
      this.iconclass = 'fa math-sum';
      this.addToEditor = '<mathjax-holder><math><msup><mi>r</mi><mn>3</mn></msup><math></mathjax-holder>';
      this.compile = true;

      this.initialise = function($node, replaceWith) {
        var content = $node.html();
        var newNode = $('<mathjax-holder>');
        newNode.html(content);
        return replaceWith(newNode);
      };

      this.onDblClick = function($node, $scope, editor) {

        editor.showEditPane({
            markup: $scope.originalMarkup
          },
          'Edit the Math',
          '<mathjax-dialog></mathjax-dialog>',
          function onUpdate(update) {
            $scope.originalMarkup = update.markup;
          }
        );
      };

      this.getMarkUp = function($node, $scope) {
        return '<math>' + $scope.originalMarkup + '</math>';
      };
    }
    return FeatureDef;
  }
]);