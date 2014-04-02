var controller = function ($scope, $modal, Overlay) {
  $scope.createNew = function() {
    Overlay.open({
      title: "Title",
      template: $('#new-supporting-material-modal').html(),
      target: $('.supporting-materials'),
      scope: $scope,
      ok: function(update) {
        console.log(update);
      }
    });

    // TODO: Remove this workaround if/when overlay works officially outsize wiggiwiz
    $('#overlay-holder').appendTo($('.supporting-materials'));
  };

  $scope.confirm = function() {
    var confirmationModal = $modal.open({
      template: $('#save-supporting-material-modal').html(),
      windowClass: 'save-supporting-material-window',
      scope: $scope,
      controller: function($scope, $modalInstance) {
        var otherType = 'Other';
        function isOther() { return $scope.data.materialType === otherType; }
        function getType() { return isOther() ? $scope.data.textMaterialType : $scope.data.materialType; }

        $scope.materialTypes = ['Rubric', 'Student Work', otherType];
        $scope.data = {
          materialType: $scope.materialType ?
            (($scope.materialTypes.indexOf($scope.materialType) > 0) ? $scope.materialType : otherType) :
            $scope.materialTypes[0],
          title: $scope.title,
          textMaterialType: ($scope.materialTypes.indexOf($scope.materialType) > 0) ? '' : $scope.materialType
        };
        $scope.displayOther = isOther();

        $scope.$watch('data.materialType', function() { $scope.displayOther = isOther(); });


        $scope.ok = function() {
          $modalInstance.close({ materialType: getType(), title: $scope.data.title });
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      },
      resolve: {
        materialType: function() { return $scope.materialType; },
        title: function() { return $scope.title; }
      }
    });

    confirmationModal.result.then(function(data) {
      $scope.materialType = data.materialType;
      $scope.title = data.title;
    });
  };

  $scope.createNew();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials',
    ['$scope',
     '$modal',
     'Overlay',
      controller]);
