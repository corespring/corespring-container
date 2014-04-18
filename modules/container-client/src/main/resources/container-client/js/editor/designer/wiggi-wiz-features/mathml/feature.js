angular.module('corespring.wiggi-wiz-features').factory('WiggiMathMlFeatureDef', [

  function() {

    function FeatureDef() {
      this.name = 'math-ml';
      this.tagName = 'math';
      this.iconclass = 'fa math-sum';
      this.addToEditor = '<math-ml-holder><msup><mi>r</mi><mn>3</mn></msup></math-ml-holder>';
      this.compile = true;

      this.initialise = function($node, replaceWith) {
        var content = $node.html();
        return replaceWith($('<math-ml-holder><math>' + content + '</math></math-ml-holder>'));
      };

      this.onDblClick = function($node, $scope, editor) {

        editor.showEditPane({
            markup: $scope.originalMarkup
          },
          'Edit the Math',
          '<math-ml-dialog></math-ml-dialog>',
          function onUpdate(update) {
            $scope.originalMarkup = update.markup;
          }
        );
      };

      this.getMarkUp = function($node, $scope) {
        return $scope.originalMarkup;
      };
    }
    return FeatureDef;
  }
]);