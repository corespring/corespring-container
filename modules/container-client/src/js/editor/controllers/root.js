angular.module('corespring-editor.controllers')
  .controller('Root', [
    '$scope',
    '$timeout',
    'ConfigurationService',
    'editorDebounce',
    'EditorDialogTemplate',
    'iFrameService',
    'ItemService',
    'LogFactory',
    'MetadataService',
    'ModalOpenDispatcher',
    'Msgr',
    'WIGGI_EVENTS',
    'WiggiDialogLauncher',
    function(
      $scope,
      $timeout,
      ConfigurationService,
      editorDebounce,
      EditorDialogTemplate,
      iFrameService,
      ItemService,
      LogFactory,
      MetadataService,
      ModalOpenDispatcher,
      Msgr,
      WIGGI_EVENTS,
      WiggiDialogLauncher
    ) {

      "use strict";

      var logger = LogFactory.getLogger('root-controller');

      ModalOpenDispatcher.setListener(onModalOpened);

      $scope.onItemLoadError = onItemLoadError;
      $scope.onItemLoadSuccess = onItemLoadSuccess;

      $scope.$on(WIGGI_EVENTS.LAUNCH_DIALOG, onLaunchDialog);
      $scope.$on('itemChanged', onItemChanged);

      init();

      //-------------------------------

      function onModalOpened(jqueryModal){
        Msgr.send('getScrollPosition', function(err, pos){
          jqueryModal.offset({top: pos.top});
        });
      }

      function saveAll(done){
        logger.debug('saveAll...');

        ItemService.saveAll($scope.item, function() {
          logger.debug('call \'saveAll\' callback...');
          editorDebounce.flush();
          $timeout(function(){
            done(null, {saved: true});
          }, 300);
        });
      }

      function init() {
        if (iFrameService.isInIFrame() && !iFrameService.bypassIframeLaunchMechanism()) {
          Msgr.on('initialise', onInitialise);
          
          Msgr.on('saveAll', function(data, done){
            logger.debug('received \'saveAll\' event');
            saveAll(done || function(){});
          });

          //send msg "ready" to instance
          //this will result in msg "initialise" being sent back to us
          logger.log('sending ready');
          Msgr.send('ready');
        } else {
          ConfigurationService.setConfig({});
          ItemService.load($scope.onItemLoadSuccess, $scope.onItemLoadError);
        }


        function onInitialise(data) {
          logger.log('on initialise', data);
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
        MetadataService.get($scope.item.itemId).then(function(result) {
          $scope.metadataSets = result;
        });
      }

      function onItemLoadError(err) {
        logger.error('error loading', err);
      }

    }
  ]);