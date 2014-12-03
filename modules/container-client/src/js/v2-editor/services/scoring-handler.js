angular.module('corespring-editor.services')
  .service('ScoringHandler', [
    '$modal',
    'LogFactory',

  function ($modal, LogFactory) {

    var logger = LogFactory.getLogger('scoring-handler');

    function ScoringHandler(){
      this.scoring = function(components, xhtml, saveCallback) {
        var modalInstance = $modal.open({
          templateUrl: '/templates/popups/scoring',
          controller: 'ScoringPopupController',
          size: 'lg',
          backdrop: 'static',
          resolve: {
            components: function() {
              var typeAndWeights = _.mapValues(components,
                function(v) {
                  return {
                    componentType: v.componentType,
                    weight: v.weight
                  };
                });
              return typeAndWeights;
            },
            xhtml: function() {
              return xhtml;
            }
          }
        });

        function weightsDiffer(a, b) {
          for (var x in a) {
            if (a[x].weight !== b[x].weight) {
              return true;
            }
          }
          return false;
        }

        function onScoringComplete(typeAndWeights) {
          logger.debug('scoring ok-ed - save');

          if (weightsDiffer(typeAndWeights, components)) {
            _.forIn(components, function(comp, key) {
              comp.weight = typeAndWeights[key].weight;
            });

            logger.debug('weights are different - save');
            //TODO - only update the weights?
            saveCallback();
          }
        }

        function onScoringDismiss() {
          logger.debug('scoring dismissed');
        }

        modalInstance.result.then(onScoringComplete, onScoringDismiss);
      };
    }

    return new ScoringHandler();
  }


  ]);