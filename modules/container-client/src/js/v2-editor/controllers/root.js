angular.module('corespring-editor.controllers')
  .controller(
  'Root',
  [ '$scope', 'ItemService', 'LogFactory', '$state',
    function($scope, ItemService, LogFactory, $state) {
      var logger = LogFactory.getLogger('RootController');
      logger.debug('Root');

      function preprocessComponents(item) {
        _.each(item.components, function(c, key) {
          var serverLogic = corespring.server.logic(c.componentType);
          if (serverLogic.preprocess) {
            //TODO: This is part of a larger task to add preprocess to the container
            //@see: https://thesib.atlassian.net/browse/CA-842
            item.components[key] = serverLogic.preprocess(c);
          }
        });
      }

      function updateSummaryFeedback(item) {
        $scope.isSummaryFeedbackSelected = !!item.summaryFeedback;
      }

      ItemService.load(function(item) {
        $scope.item = item;
        $scope.data = {
          item: item
        };
        preprocessComponents(item);
        updateSummaryFeedback(item);
        var max = 0;
        $('<div>' + $scope.item.xhtml + '</div>').find('[id]').each(function(idx, element) {
          var id = Number($(element).attr('id'));
          if (id > max) {
            max = id;
          }
        });
        $scope.lastId = max;
        $scope.$broadcast('itemLoaded');
      }, function() {
        logger.error('error loading');
      });

      $scope.$on('deleteSupportingMaterial', function(event, data) {
        function deleteSupportingMaterial(index) {
          $scope.data.item.supportingMaterials.splice(index, 1);
          ItemService.save({
              supportingMaterials: $scope.data.item.supportingMaterials
            },
            function() {
              $state.transitionTo('supporting-materials', {
                index: 0
              }, {reload: true});
            },
            $scope.onSaveError, $scope.itemId
          );
        }

        var confirmationMessage = [
          "You are about to delete this file.",
          "Are you sure you want to do this?"
        ].join('\n');

        if (window.confirm(confirmationMessage)) {
          deleteSupportingMaterial(data.index);
        }
      });

    }
  ]
);
