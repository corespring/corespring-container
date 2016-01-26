angular.module('corespring-singleComponentEditor.controllers')
  .controller('Root', [
    '$scope',
    '$compile',
    'LogFactory',
    'iFrameService',
    'ItemService',
    'Msgr',
    function(
      $scope,
      $compile,
      LogFactory,
      iFrameService,
      ItemService,
      Msgr) {

      "use strict";

      var logger = LogFactory.getLogger('root-controller');

      logger.log('@@ - root');
      
      var comp, configPanel;

      $scope.showNav = true;
      
      $scope.closeError = function(){
        $scope.saveError = null;
      } 

      $scope.save = function(){
        logger.debug('save...');

        var model = configPanel.getModel();

        logger.debug('model: ', JSON.stringify(model, null, '  ' ));
        var key = _($scope.item.components).keys().first();
        var data = {};
        data[key] = model;

        $scope.saveError = null;

        $scope.saving = true;
        ItemService.save(data, function(success){
          logger.debug('success:', arguments);
          $scope.saving = false;
        }, 
        function(err){
          logger.error('error', arguments);
          $scope.saveError = 'There was an error saving';
          $scope.saving = false;
        })
      } 


      $scope.onItemLoadSuccess = function(item) {
        $scope.item = item;

        //TODO: UI if item.components has more than one key
        comp = _($scope.item.components).values().first();
        var ct = comp.componentType;

        var html = [
          '<div class="config-panel-container" navigator="">',
            '<' + ct + '-config id="1"></' + ct + '>',
          '</div>'].join('\n');

        $('.configuration').html(html);
        $compile($('.configuration'))($scope.$new());
      }

      $scope.onItemLoadError = function(err) {
        logger.error('error loading', err);
        alert('Error loading the item');
      }

      $scope.$on('registerConfigPanel', function(a, id, configPanelBridge) {
        logger.debug('registerConfigPanel', id);
        configPanel = configPanelBridge;
        configPanel.setModel(comp);
      });

      function init() {

        logger.debug("init...");
        
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
          // ConfigurationService.setConfig({});
          ItemService.load($scope.onItemLoadSuccess, $scope.onItemLoadError);
        }

        function onInitialise(data) {
          logger.log('on initialise', data);
          // ConfigurationService.setConfig(data);
          ItemService.load($scope.onItemLoadSuccess, $scope.onItemLoadError);
          //We need to trigger an ng digest as this event is outside the app's scope.
          $scope.$digest();
          Msgr.send('rendered');
        }
      }

      init();

    }]);