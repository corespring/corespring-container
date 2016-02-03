angular.module('corespring-singleComponentEditor.controllers')
  .controller('Root', [
    '$scope',
    '$timeout',
    '$compile',
    'LogFactory',
    'iFrameService',
    'Msgr',
    'DesignerService',
    'ComponentDefaultData',
    'ComponentData',
    'WiggiDialogLauncher',
    'EditorDialogTemplate',
    'COMPONENT_EDITOR',
    'WIGGI_EVENTS',    
    function(
      $scope,
      $timeout,
      $compile,
      LogFactory,
      iFrameService,
      Msgr, 
      DesignerService,
      ComponentDefaultData,
      ComponentData,
      WiggiDialogLauncher,
      EditorDialogTemplate,
      COMPONENT_EDITOR,
      WIGGI_EVENTS) {

      "use strict";

      var componentType = COMPONENT_EDITOR.componentType;

      var logger = LogFactory.getLogger('root-controller');

      logger.log('@@ - root');
      
      var configPanel;

      $scope.playerMode = 'gather';

      $scope.showNavigation = true;

      $scope.activePane = 'config';

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
        $scope.activePane = 'preview';
      };

      $scope.closeError = function(){
        $scope.saveError = null;
      }; 

      $scope.getData = function(){
        return angular.copy(configPanel.getModel());
      };

      $scope.$on('registerConfigPanel', function(a, id, configPanelBridge) {
        logger.debug('registerConfigPanel', id);
        configPanel = configPanelBridge;
        configPanel.setModel($scope.item.components['1']);
      });

      function onLaunchDialog($event, data, title, body, callback, scopeProps, options) {
        var dialog = new WiggiDialogLauncher($event.targetScope);
        var header = options.omitHeader ? '' : null;
        var footer = options.omitFooter ? '' : null;
        var content = EditorDialogTemplate.generate(title, body, header, footer);
        dialog.launch(data, content, callback, scopeProps, options);
      }


      $scope.$on(WIGGI_EVENTS.LAUNCH_DIALOG, onLaunchDialog);
      

      function init() {

        logger.debug("init...");
      
        function storeDefaultData(comp){
          logger.debug('set default data', comp.componentType, comp.defaultData);

          ComponentDefaultData.setDefaultData(comp.componentType, comp.defaultData);
        }

        //TODO: Some components are calling ComponentDefaultData - they shouldn't be
        //cos it's breaking the contract between the components and the container.
        DesignerService.loadAvailableUiComponents(function(data){
          _.forEach(data.interactions, storeDefaultData);
        });
  

        function initMsgrListeners(){
          Msgr.on('showNavigation', function(showNavigation){
            $scope.showNavigation = showNavigation;
          });
          
          Msgr.on('showPane', function(pane, done){
            if(pane === 'config'){
              $scope.showConfig(done);
            } else if(pane === 'preview'){
              $scope.showPreview(done);
            }
          });

          Msgr.on('getData', function(err, done){
            done(null, $scope.getData());
          });

          Msgr.on('setData', function(data, done){
            $scope.item.components['1'] = data;
            configPanel.setModel($scope.item.components['1']);
            done(null);
          });

          Msgr.send('rendered');
        }        

        if (iFrameService.isInIFrame() && !iFrameService.bypassIframeLaunchMechanism()) {
          Msgr.on('initialise', function(data){
            initMsgrListeners();
            onInitialise(data);
          });

          logger.log('sending ready');
          Msgr.send('ready');
        } else {
          onInitialise({});
        }

        function onInitialise(data) {
          logger.log('on initialise', data);
          
          var initialData = { 
            xhtml: '<div><div '+ componentType + '="" id="1"></div></div>',
            components: { 
              '1': ComponentDefaultData.getDefaultData(COMPONENT_EDITOR.componentType)
            }
          };

          initialData.xhtml = data.xhtml ? data.xhtml : initialData.xhtml;
          initialData.components['1'] = data.componentModel ? data.componentModel : initialData.components['1'];
          
          $scope.showNavigation = data.showNavigation === true ? true : false;
          $scope.item = angular.copy(initialData);

          ComponentData.setModel($scope.item.components);

          var html = [
            '<div class="config-panel-container" navigator="">',
              '<' + componentType + '-config id="1"></' + componentType + '>',
            '</div>'].join('\n');

          $('.configuration').html(html);
          
          $compile($('.configuration'))($scope.$new());

          $timeout(function() {
            $scope.$digest(); 
          });
        }
      }

      init();

    }]);