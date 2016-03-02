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

      $scope.data = {prompt: 'hi there'};

      $scope.$watch('data.prompt', function(newValue){
        if($scope.item){
          $scope.item.xhtml = getXhtml(newValue);

          $timeout(function(){
            ComponentData.updateComponent($scope.componentKey, $scope.item.components[$scope.componentKey]);
          }, 1000);
        }
      }, true);

      function getXhtml(prompt){

        prompt =  prompt ? '<prompt>' +  prompt + '</prompt>' : '';

        return [
         '<div class="root">',
            prompt,
         '  <div '+ componentType + '="" id="' + $scope.componentKey +'"></div>',
         '</div>'
        ].join('\n');
      }

      $.lockfixed(".preview-pane", {});
      
      /**
       * A key for use in the item model.
       */
      $scope.componentKey = SINGLE_COMPONENT_KEY;

      $scope.closeError = function(){
        $scope.saveError = null;
      }; 

      $scope.getData = function(){
        var out = { 
          components: {}
        };

        out.components[$scope.componentKey] = angular.copy(configPanel.getModel());
        out.xhtml = $scope.item.xhtml;
        return out;
      };

      function readPrompt(xhtml, done){
        try {
          var parser = new DOMParser();
          var doc = parser.parseFromString(xhtml, 'text/html'); 
          console.log(doc);
          var promptNode = doc.querySelector('prompt');
          var out = promptNode ? promptNode.innerHTML : undefined;
          if(!out){
            done('unable to read prompt in: ' + xhtml);
          } else {
            done(null, out);
          }
        } catch(e){
          done(e);
        }
      }

      $scope.setData = function(data, done){

        if(!data || !data.components || !data.components[$scope.componentKey]){
          done('Invalid data must be in the form: { components: { '+$scope.componentKey+': {...}}}');
          return;
        }

        ComponentData.deleteComponent($scope.componentKey);
        $scope.item.components[$scope.componentKey] = data.components[$scope.componentKey];
        $scope.item.xhtml = data.xhtml;

        readPrompt($scope.item.xhtml, function(err, prompt){
          if(err){
            done(err);
          } else {
            $scope.data.prompt = prompt;
            configPanel.setModel($scope.item.components[$scope.componentKey]);
            ComponentData.updateComponent($scope.componentKey, $scope.item.components[$scope.componentKey]);
            done(null);
          }
        });
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

      // $scope.$watch('item', function(){
      //   $scope.$broadcast('client-side-preview.reset-player');
      // }, true);


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

            $scope.setData(data, done);
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
            xhtml: getXhtml($scope.data.prompt), 
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