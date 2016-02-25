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
    'SINGLE_COMPONENT_KEY',    
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
      WIGGI_EVENTS, 
      SINGLE_COMPONENT_KEY) {

      "use strict";

      var componentType = COMPONENT_EDITOR.componentType;

      var logger = LogFactory.getLogger('root-controller');

      var configPanel;

      $scope.playerMode = 'gather';

      /**
       * A key for use in the item model.
       */
      $scope.componentKey = SINGLE_COMPONENT_KEY;

      $scope.closeError = function(){
        $scope.saveError = null;
      }; 

      $scope.getData = function(){
        return angular.copy(configPanel.getModel());
      };

      $scope.$on('registerConfigPanel', function(a, id, configPanelBridge) {
        logger.debug('registerConfigPanel', id);
        configPanel = configPanelBridge;
        configPanel.setModel($scope.item.components[$scope.componentKey]);
        ComponentData.setModel($scope.item.components);
        $timeout(function(){ 
          ComponentData.setModel($scope.item.components);
        });
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
          Msgr.on('getData', function(err, done){
            done(null, $scope.getData());
          });

          Msgr.on('setData', function(data, done){
            $scope.item.components[$scope.componentKey] = data;
            configPanel.setModel($scope.item.components[$scope.componentKey]);
            done(null);
          });

          Msgr.on('getComponentKey', function(err, done){
            done(null, $scope.componentKey);
          });

          //Preview mode
          Msgr.on('showPreview', function(show){
            $scope.item.components[$scope.componentKey] = $scope.getData();
            $scope.$broadcast('showPreview', show);
          });
          
          //Tabs mode 
          Msgr.on('showPane', function(pane){
            $scope.item.components[$scope.componentKey] = $scope.getData();
            $scope.$broadcast('showPane', pane);
          });
          
          Msgr.on('showNavigation', function(show){
            $scope.$broadcast('showNavigation', show);
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
            xhtml: '<div><div '+ componentType + '="" id="' + $scope.componentKey +'"></div></div>',
            components: {} 
          };

          initialData.xhtml = data.xhtml ? data.xhtml : initialData.xhtml;
          var defaultData = ComponentDefaultData.getDefaultData(COMPONENT_EDITOR.componentType);
          initialData.components[$scope.componentKey] = data.componentModel ? data.componentModel : defaultData;
          
          $scope.showNavigation = data.showNavigation === true ? true : false;
          $scope.item = angular.copy(initialData);

          var html = [
            '<div class="config-panel-container" navigator="">',
              '<' + componentType + '-config id="' + $scope.componentKey +'"></' + componentType +'-config>',
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