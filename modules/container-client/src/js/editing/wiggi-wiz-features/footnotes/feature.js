angular.module('corespring-editing.wiggi-wiz-features.footnotes').factory('WiggiFootnotesFeatureDef', [
  'LogFactory',
  function(LogFactory) {

    var $log = LogFactory.getLogger('WiggiFootnotesFeatureDef');

    function FeatureDef() {
      this.name = 'footnotes';
      this.attributeName = 'footnotes';
      this.title = "Footnote";
      this.draggable = true;
      //this.iconclass = 'fa fa-flash'; //TODO find better icon, a foot maybe? ;)
      this.addToEditor = '<div footnotes-holder></div>';
      this.compile = true;

      this.initialise = function($node, replaceWith) {
        var content = $node.html();
        var newNode = $('<div footnotes-holder>');
        newNode.html(content);
        return replaceWith(newNode);
      };

      this.editNode = function($node, $scope, editor) {

        editor.showEditPane($scope,
          'Edit the Footnotes',
          '<footnotes-dialog ng-model="data.originalMarkup"></footnotes-dialog>',
          function onUpdate() {},
          null,
          function onClose() {
            $scope.$emit('save-data');
          }
        );
      };

      this.getMarkUp = function($node, $scope) {
        return '<div footnotes>' + $scope.originalMarkup + '</div>';
      };
    }
    return FeatureDef;
  }
]);