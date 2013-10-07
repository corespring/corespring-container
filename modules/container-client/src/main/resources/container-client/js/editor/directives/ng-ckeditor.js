angular.module('corespring-editor.directives').directive('ngCkeditor', function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ngModel) {
      console.log("LINKING CKEDITOR");

      var ck = CKEDITOR.replace(elm[0],{
        toolbar: [
          [ 'Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo' ],			// Defines toolbar group without name.
          [ 'Bold', 'Italic', 'Underline' ],
          [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]
        ],
        height: '100px'
      });

      if (!ngModel) return;

      ck.on('pasteState', function() {
        console.log("*** updating state ", ck.getData());
        scope.$apply(function() {
          ngModel.$setViewValue(ck.getData());
        });
      });

      ngModel.$render = function(value) {
        ck.setData(ngModel.$viewValue);
      };
    }
  };
});

angular.module('corespring-editor.directives').directive('ngBindHtmlUnsafe', ['$sce', function($sce){
  return {
    scope: {
      ngBindHtmlUnsafe: '=',
    },
    template: "<div ng-bind-html='trustedHtml'></div>",
    link: function($scope, iElm, iAttrs, controller) {
      $scope.updateView = function() {
        $scope.trustedHtml = $sce.trustAsHtml($scope.ngBindHtmlUnsafe);
      }

      $scope.$watch('ngBindHtmlUnsafe', function(newVal, oldVal) {
        $scope.updateView(newVal);
      });
    }
  };
}]);