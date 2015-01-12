angular.module('corespring-editor.services')
  .service('ScoringHandler', [
    '$modal',
    'LogFactory',

  function ($modal, LogFactory) {

    var logger = LogFactory.getLogger('scoring-handler');

    function ScoringHandler(){
      this.scoring = function(components, xhtml, saveCallback) {

        var isComponentScorable = function(component) {
          var serverLogic = corespring.server.logic(component.componentType);
          if (_.isFunction(serverLogic.isScoreable)) {
            return serverLogic.isScoreable(component);
          }
          return true;
        };

        var weightForComponent = function(component) {
          var weight = _.isUndefined(component.weight) ? 1 : component.weight;
          weight = isComponentScorable(component) ? weight : 0;
          return weight;
        };

        var typeAndWeights = _.mapValues(components,
          function(v) {
            return {
              componentType: v.componentType,
              weight: weightForComponent(v),
              isScorable: isComponentScorable(v)
            };
          }, this);

        var modalInstance = $modal.open({
          templateUrl: '/templates/popups/scoring',
          controller: 'ScoringPopupController',
          size: 'lg',
          backdrop: 'static',
          resolve: {
            components: function() {
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

        function onScoringClose() {
          logger.debug('scoring closed');
          handlePopupRemoved();
        }

        /** even if the popup is dismissed we save if required */
        function onScoringDismiss() {
          logger.debug('scoring dismissed');
          handlePopupRemoved();
        }

        function handlePopupRemoved(){

          if (!weightsDiffer(typeAndWeights, components)) {
            logger.debug('weights haven\'t changed - skip save');
            return;
          }

          _.forIn(components, function(comp, key) {
            comp.weight = typeAndWeights[key].weight;
          });

          logger.debug('weights are different - save');
          //TODO - only update the weights?
          saveCallback();
        }

        modalInstance.result.then(onScoringClose.bind(this), onScoringDismiss.bind(this));
      };
    }

    return new ScoringHandler();
  }


  ]);
