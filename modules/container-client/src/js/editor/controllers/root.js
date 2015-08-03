angular.module('corespring-editor.controllers')
  .controller('Root', [
    '$scope',
    '$state',
    '$window',
    'ComponentRegister',
    'ConfigurationService',
    'EditorDialogTemplate',
    'iFrameService',
    'ItemService',
    'LogFactory',
    'Msgr',
    'WIGGI_EVENTS',
    'WiggiDialogLauncher',
    function(
      $scope,
      $state,
      $window,
      ComponentRegister,
      ConfigurationService,
      EditorDialogTemplate,
      iFrameService,
      ItemService,
      LogFactory,
      Msgr,
      WIGGI_EVENTS,
      WiggiDialogLauncher) {

      "use strict";

      var $log = LogFactory.getLogger('RootController');

      $scope.onItemLoadSuccess = onItemLoadSuccess;
      $scope.onItemLoadError = onItemLoadError;

      $scope.$on('deleteSupportingMaterial', onDeleteSupportingMaterial);
      $scope.$on(WIGGI_EVENTS.LAUNCH_DIALOG, onLaunchDialog);
      $scope.$on('itemChanged', onItemChanged);

      init();

      //----------------------------------------------

      function init() {
        if (iFrameService.isInIFrame() && !iFrameService.bypassIframeLaunchMechanism()) {
          Msgr.on('initialise', onInitialise);
          
          Msgr.on('*', function(eventName, data, done){
            $log.info("[Root.broadcastToChildren] " + eventName);
            $scope.$broadcast(eventName, data, done);
          });

          /*Msgr.on('saveAll', function() {
            $scope.$broadcast('saveAll');
          });*/
          /*$scope.$on('savedAll', function() {
            Msgr.send('savedAll');
          });*/
          //send msg "ready" to instance
          //this will result in msg "initialise" being sent back to us
          $log.log('sending ready');
          Msgr.send('ready');
        } else {
          ConfigurationService.setConfig({});
          ItemService.load($scope.onItemLoadSuccess, $scope.onItemLoadError);
        }

        function onInitialise(data) {
          $log.log('on initialise', data);
          ConfigurationService.setConfig(data);
          ItemService.load($scope.onItemLoadSuccess, $scope.onItemLoadError);
          //We need to trigger an ng digest as this event is outside the app's scope.
          $scope.$digest();
          Msgr.send('rendered');
        }
      }

      function onItemChanged(event, data) {
        Msgr.send('itemChanged', data);
      }

      function onDeleteSupportingMaterial(event, data) {

        var confirmationMessage = [
          "You are about to delete this file.",
          "Are you sure you want to do this?"
        ].join('\n');

        if ($window.confirm(confirmationMessage)) {
          showFirstItem();
          deleteSupportingMaterial(data.index);
        }
      }

      function showFirstItem() {
        $state.transitionTo('supporting-materials', {
          index: "0"
        }, {
          reload: true
        });
      }

      function deleteSupportingMaterial(index) {
        $scope.item.supportingMaterials.splice(index, 1);

        ItemService.saveSupportingMaterials($scope.item.supportingMaterials,
          function() {},
          $scope.onSaveError, $scope.itemId
        );
      }

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

      function findLastId(item) {
        var max = 0;
        $('<div>' + item.xhtml + '</div>').find('[id]').each(function(idx,
          element) {
          var id = Number($(element).attr('id'));
          if (id > max) {
            max = id;
          }
        });
        return max;
      }


      function onLaunchDialog($event, data, title, body, callback, scopeProps, options) {
        var dialog = new WiggiDialogLauncher($event.targetScope);
        var header = options.omitHeader ? '' : null;
        var footer = options.omitFooter ? '' : null;
        var content = EditorDialogTemplate.generate(title, body, header, footer);
        dialog.launch(data, content, callback, scopeProps, options);
      }

      function onItemLoadSuccess(item) {
        $scope.item = item;
        preprocessComponents(item);
        $scope.lastId = findLastId(item);
        $scope.$broadcast('itemLoaded', item);
      }

      function onItemLoadError(err) {
        $log.error('error loading', err);
      }

    }
  ]);