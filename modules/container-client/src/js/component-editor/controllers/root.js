angular.module('corespring-singleComponentEditor.controllers')
  .controller('Root', [
    '$scope',
    '$compile',
    'LogFactory',
    'iFrameService',
    'ItemService',
    'Msgr',
    'DesignerService',
    'ComponentDefaultData',
    'ComponentData',
    function(
      $scope,
      $compile,
      LogFactory,
      iFrameService,
      ItemService,
      Msgr, 
      DesignerService,
      ComponentDefaultData,
      ComponentData) {

      "use strict";

      function storeDefaultData(comp){
        ComponentDefaultData.setDefaultData(comp.componentType, comp.defaultData);
      }

      //TODO: Some components are calling ComponentDefaultData - they shouldn't be
      //cos it's breaking the contract between the components and the container.
      DesignerService.loadAvailableUiComponents(function(data){
        _.forEach(data.interactions, storeDefaultData);
      });

      var logger = LogFactory.getLogger('root-controller');

      logger.log('@@ - root');
      
      var comp, configPanel;

      $scope.playerMode = 'gather';

      $scope.showNavigation = true;

      $scope.activePane = 'config';

      $scope.previewEnabled = true; 
      
      $scope.showConfig = function(done){
        done = done || function(){};
        $scope.activePane = 'config';
        done();
      };

      $scope.$watch('activePane', function(a){
        if(a === 'config'){
          $scope.configActive = true;
          $scope.previewActive = false;
        } else {
          $scope.configActive = false;
          $scope.previewActive = true;
        }
      });

      $scope.showPreview = function(done){
        done = done || function(){};

        $scope.item.components['1'] = $scope.getData();

        if($scope.previewEnabled){
          $scope.activePane = 'preview';
          done();
        } else {
          done('Preview is disabled');
        }
      };

      $scope.closeError = function(){
        $scope.saveError = null;
      }; 

      $scope.save = function(onSuccess, onError){

        onSuccess = onSuccess || function(){};
        onError = onError || function(){};

        logger.debug('save...');

        var model = $scope.getData();

        logger.debug('model: ', JSON.stringify(model, null, '  ' ));
        var key = _($scope.item.components).keys().first();
        var data = {};
        data[key] = model;

        $scope.saveError = null;

        $scope.saving = true;
        ItemService.save(data, function(success){
          logger.debug('success:', arguments);
          $scope.saving = false;
          onSuccess();
        }, 
        function(err){
          logger.error('error', arguments);
          $scope.saveError = 'There was an error saving';
          $scope.saving = false;
          onError(err);
        });
      };

      $scope.getData = function(){
        return angular.copy(configPanel.getModel());
      };


      $scope.onItemLoadSuccess = function(item) {
        $scope.item = item;
        ComponentData.setModel(item.components);

        //TODO: UI if item.components has more than one key
        comp = _($scope.item.components).values().first();
        var ct = comp.componentType;

        var html = [
          '<div class="config-panel-container" navigator="">',
            '<' + ct + '-config id="1"></' + ct + '>',
          '</div>'].join('\n');

        $('.configuration').html(html);
        $compile($('.configuration'))($scope.$new());
      };

      $scope.onItemLoadError = function(err) {
        logger.error('error loading', err);
        alert('Error loading the item');
      };

      $scope.$on('registerConfigPanel', function(a, id, configPanelBridge) {
        logger.debug('registerConfigPanel', id);
        configPanel = configPanelBridge;
        configPanel.setModel(comp);
      });

      function init() {

        logger.debug("init...");
        
        if (iFrameService.isInIFrame() && !iFrameService.bypassIframeLaunchMechanism()) {
          Msgr.on('initialise', onInitialise);
          
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

          Msgr.on('showNavigation', function(showNavigation){
            $scope.showNavigation = showNavigation;
          });

          Msgr.on('showSaveButton', function(show){
            $scope.showSaveButton = show;
          });
          
          Msgr.on('previewEnabled', function(previewEnabled){
            $scope.previewEnabled = previewEnabled;
          });
          
          Msgr.on('showPane', function(pane, done){
            if(pane === 'config'){
              $scope.showConfig(done);
            } else if(pane === 'preview'){
              $scope.showPreview(done);
            }
          });

          Msgr.on('save', function(err, done){
            $scope.save(function(){
              done(null);
            }, function(err){
              done('Save failed');
            });
          });

          Msgr.on('getData', function(err, done){
            done(null, $scope.getData());
          });

          Msgr.send('rendered');

          //Draft functions??
        }
      }

      init();

    }]);