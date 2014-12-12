angular.module('corespring-common.services')
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
            windowClass: 'catalog-preview-modal',
            template: [
              '<div class="catalog-preview">',
              '  <div class="header">',
              '    <span class="pull-right"><button ng-click="close()" class="button btn-sm btn btn-success">Close</button>',
              '  </div>',
              '<optimized-preview-player ',
              '  ng-model="xhtml" ',
              '  player-components="json"></optimized-preview-player>',
              //'  <iframe ng-src="{{url}}" frameborder="0"></iframe>',
              '</div>'
            ].join('\n'),
            /**
             * We need to pass the parameters as an array of string so that minification doesn't break.
             */
            controller: ['$scope', '$modalInstance', 'url', ModalPreview],
            size: 'lg',
            resolve: {
              url: function() {
                return '../../item/' + itemId + '/preview';
              }
            }
          });
        };
      }
      return new CatalogPreview();
    }
  ]);
