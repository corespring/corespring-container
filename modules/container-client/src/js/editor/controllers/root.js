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
    'Msgr',
    'WIGGI_EVENTS',
    'WiggiDialogLauncher',
    '$state',
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
      Msgr,
      WIGGI_EVENTS,
      WiggiDialogLauncher,
      $state
    ) {

      "use strict";

      var logger = LogFactory.getLogger('root-controller');

      $scope.onItemLoadError = onItemLoadError;
      $scope.onItemLoadSuccess = onItemLoadSuccess;
      $scope.isTabVisible = isTabVisible;

      $scope.$on(WIGGI_EVENTS.LAUNCH_DIALOG, onLaunchDialog);
      $scope.$on('itemChanged', onItemChanged);
      $scope.$on('itemError', onItemError);
      $scope.$on('clearItemError', onClearItemError);

      init();

      //-------------------------------

      function isTabVisible(tab) {
        var maybeTab = ($scope.tabs || {})[tab];
        return _.isUndefined(maybeTab) ? true : maybeTab;
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

      function updateTabs() {
        if (!isTabVisible($state.current.name)) {
          var tabOrder = ['question', 'profile', 'supporting-materials', 'metadata'];
          var firstNotHiddenTab = _.find(tabOrder, isTabVisible);
          $state.go(firstNotHiddenTab);
        }
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
          $scope.tabs = data.tabs;
          ItemService.load($scope.onItemLoadSuccess, $scope.onItemLoadError);
          //We need to trigger an ng digest as this event is outside the app's scope.
          $scope.$digest();
          Msgr.send('rendered');
          updateTabs();
        }
      }

      function onItemChanged(event, data) {
        Msgr.send('itemChanged', data);
      }

      function onItemError(event, data) {
        Msgr.send('itemError', data);
      }

      function onClearItemError(event, data) {
        Msgr.send('clearItemError', data);
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

        if (item.apiVersion === 1) {
          $scope.tabs = $scope.tabs || {};
          $scope.tabs.question = !!$scope.tabs.question;
          updateTabs();
        }
      }

      function onItemLoadError(err) {
        logger.error('error loading', err);
      }

    }
  ]);