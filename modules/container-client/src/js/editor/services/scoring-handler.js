angular.module('corespring-editor.services')
  .service('ScoringHandler', [
    '$modal',
    'LogFactory',

  function ($modal, LogFactory) {

    var logger = LogFactory.getLogger('scoring-handler');

    function ScoringHandler(){

      this.scoring = function(components, xhtml, itemConfig, saveCallback) {

        var typeAndWeights = _.mapValues(components, getTypeAndWeight, this);

        var newItemConfig = {
          scoringType: itemConfig.scoringType
        };

        var modalInstance = $modal.open({
          templateUrl: '/templates/popups/scoring',
          controller: 'ScoringPopupController',
          size: 'lg',
          backdrop: 'static',
          resolve: {
            //provide all the properties you want
            //to inject into the popup controller
            components: function() {
              return typeAndWeights;
            },
            itemConfig: function(){
              return newItemConfig;
            },
            xhtml: function() {
              return xhtml;
            }
          }
        });

        modalInstance.result.then(onScoringClose.bind(this), onScoringDismiss.bind(this));

        //-----------------------------------------------

        function getTypeAndWeight(v) {
          return {
            componentType: v.componentType,
            weight: weightForComponent(v),
            isScoreable: isComponentScorable(v)
          };
        }

        function isComponentScorable(component) {
          var serverLogic = corespring.server.logic(component.componentType);
          if (_.isFunction(serverLogic.isScoreable)) {
            return serverLogic.isScoreable(component);
          }
          return true;
        }

        function weightForComponent(component) {
          var weight = _.isUndefined(component.weight) ? 1 : component.weight;
          weight = isComponentScorable(component) ? weight : 0;
          return weight;
        }

        function weightsDiffer(a, b) {
          for (var x in a) {
            if (a[x].weight !== b[x].weight) {
              return true;
            }
          }
          return false;
        }

        function configsDiffer(a,b){
          for (var x in a) {
            if (a[x] !== b[x]) {
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

          if (!(configsDiffer(newItemConfig, itemConfig)) && !weightsDiffer(typeAndWeights, components)) {
            logger.debug('config & weights haven\'t changed - skip save');
            return;
          }

          _.forIn(components, function(comp, key) {
            comp.weight = typeAndWeights[key].weight;
          });

          _.forIn(newItemConfig, function(value, key) {
            itemConfig[key] = value;
          });

          logger.debug('config and/or weights are different - save');

          //TODO - only update the changes?
          saveCallback();
        }

      };
    }

    return new ScoringHandler();
  }


  ]);
