angular.module('corespring-editor.services')
  .service('CatalogPreview', [
    '$modal',
    function($modal) {

      var ModalPreview = function($scope, $modalInstance, url) {
        $scope.url = url;
        $scope.close = function() {
          $modalInstance.close();
        };
      };

      function CatalogPreview() {
        this.launch = function(itemId) {
          var modalInstance = $modal.open({
            template: [
              '<div class="catalog-preview">',
              '  <div class="header">',
              '    <span class="pull-right"><button ng-click="close()" class="button btn-sm btn btn-default">Close</button>',
              '  </div>',
              '  <iframe src="{{url}}" frameborder="0"></iframe>',
              '</div>'
            ].join('\n'),
            controller: ModalPreview,
            size: 'lg',
            resolve: {
              url: function() {
                return '../../item/' + itemId + '/preview'; //$scope.catalogUrl;
              }
            }
          });

          modalInstance.result.then(function() {}, function() {});
        };
      }
      return new CatalogPreview();
    }
  ]);