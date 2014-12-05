angular.module('corespring-editor.controllers')
  .controller('Root', [
    '$scope',
    '$state',
    'ComponentRegister',
    'ItemService',
    'LogFactory',
    'Msgr',
    function ($scope, $state, ComponentRegister, ItemService, LogFactory, Msgr) {

      var $log = LogFactory.getLogger('RootController');
      $log.debug('Root');

      function preprocessComponents(item) {
        _.each(item.components, function (c, key) {
          var serverLogic = corespring.server.logic(c.componentType);
          if (serverLogic.preprocess) {
            //TODO: This is part of a larger task to add preprocess to the container
            //@see: https://thesib.atlassian.net/browse/CA-842
            item.components[key] = serverLogic.preprocess(c);
          }
        });
      }

      function findLastId(item){
        var max = 0;
        $('<div>' + item.xhtml + '</div>').find('[id]').each(function (idx, element) {
          var id = Number($(element).attr('id'));
          if (id > max) {
            max = id;
          }
        });
        return max;
      }

      $scope.onItemLoaded = function(item){
        $scope.item = item;
        preprocessComponents(item);
        $scope.lastId = findLastId(item);
        $scope.$broadcast('itemLoaded', item);
      };

      ItemService.load($scope.onItemLoaded, function () {
        $log.error('error loading');
      });

      $scope.$on('deleteSupportingMaterial', function (event, data) {
        function showFirstItem(){
          $state.transitionTo('supporting-materials', {
            index: 0
          }, {reload: true});
        }
        function deleteSupportingMaterial(index) {
          $scope.data.item.supportingMaterials.splice(index, 1);

          //TODO change to ItemService.fineGrainedSave
          ItemService.save({
              supportingMaterials: $scope.data.item.supportingMaterials
            },
            function () {
            },
            $scope.onSaveError, $scope.itemId
          );
        }

        var confirmationMessage = [
          "You are about to delete this file.",
          "Are you sure you want to do this?"
        ].join('\n');

        if (window.confirm(confirmationMessage)) {
          showFirstItem();
          deleteSupportingMaterial(data.index);
        }
      });

      //----------------------------------------------------------------
      // startup
      //----------------------------------------------------------------

      function isInIframe(){
        /** note use != to support ie8 instead of !== */
        return top != window; // jshint ignore:line
      }

      if(isInIframe()) {
        var editorOptions;

        $scope.$on('getEditorOptions', function(){
          if (editorOptions) {
            $scope.$broadcast('getEditorOptionsResult', editorOptions);
          }
        });

        Msgr.on('initialise', function (data) {
          $log.warn('on initialise', data);
          editorOptions = data;
          $scope.$broadcast('getEditorOptionsResult', editorOptions);
          Msgr.send('rendered');
        });

        //send msg "ready" to instance
        //this will result in msg "initialise" being sent back to us
        $log.warn('sending ready');
        Msgr.send('ready');
      }
    }
  ]
);
