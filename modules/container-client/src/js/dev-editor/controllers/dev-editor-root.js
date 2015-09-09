angular.module('corespring-dev-editor.controllers')
  .controller('DevEditorRoot', [
    '$log',
    '$scope',
    '$timeout',
    'ComponentData',
    'iFrameService',
    'ItemService',
    'Msgr',
    function(
      $log,
      $scope,
      $timeout,
      ComponentData,
      iFrameService,
      ItemService,
      Msgr
    ) {

      $scope.panes = {
        html: true,
        json: false,
        scoring:false,
        player:true
      };

      $scope.aceJsonChanged = aceJsonChanged;
      $scope.onItemLoaded = onItemLoaded;
      $scope.onItemLoadError = onItemLoadError;
      $scope.save = save;
      $scope.saveAll = saveAll;

      $scope.$watch('components', updateItemChanged);
      $scope.$watch('customScoringJs', updateItemChanged);
      $scope.$watch('xhtml', updateItemChanged);

      $scope.$on('registerComponent', registerComponent);

      init();

      //-----------------------------------------

      function init() {
        if (iFrameService.isInIFrame() && !iFrameService.bypassIframeLaunchMechanism()) {
          Msgr.on('initialise', onInitialise);

          //send msg "ready" to instance
          //this will result in msg "initialise" being sent back to us
          $log.debug('sending ready');
          Msgr.send('ready');
        } else {
          ItemService.load($scope.onItemLoaded, $scope.onItemLoadError);
        }

        Msgr.on('saveAll', function(data, done){
          $log.debug('received \'saveAll\' event');
          saveAll(done || function(){});
        });

        function onInitialise(data) {
          $log.debug('on initialise', data);
          $scope.initialData = data;
          ItemService.load($scope.onItemLoaded, $scope.onItemLoadError);
          Msgr.send('rendered');
        }
      }

      function updateItemChanged(){
        var partsChanged = [];
        if (componentsHaveBeenChanged()) {
          partsChanged.push('components');
        }
        if (customScoringHasBeenChanged()) {
          partsChanged.push('customScoring');
        }
        if (xhtmlHasBeenChanged()) {
          partsChanged.push('xhtml');
        }
        if(partsChanged.length) {
          Msgr.send('itemChanged', {partsChanged: partsChanged});
        }
      }

      function onItemLoaded(item) {
        $scope.item = item;
        $scope.xhtml = item.xhtml;
        $scope.json = JSON.stringify(item.components, undefined, 2);
        $scope.customScoringJs = item.customScoring;
        $scope.components = _.cloneDeep(item.components);
        ComponentData.setModel($scope.components);
      }

      function onItemLoadError(err) {
        window.alert("There was an error. Please try later. Thanks!");
      }

      function saveAll(done){
        $log.debug('saveAll...');
        if (componentsHaveBeenChanged()) {
          $scope.item.components = $scope.components;
        }
        if (customScoringHasBeenChanged()) {
          $scope.item.customScoring = $scope.customScoringJs;
        }
        if (xhtmlHasBeenChanged()) {
          $scope.item.xhtml = $scope.xhtml;
        }
        ItemService.saveAll($scope.item, function() {
          $log.debug('call \'saveAll\' callback...');
          done(null, {saved: true});
        });
      }

      function save() {
        saveXhtmlIfChanged();
        saveComponentsIfChanged();
        saveCustomScoringIfChanged();
      }

      function xhtmlHasBeenChanged(){
        return $scope.item && $scope.xhtml !== $scope.item.xhtml;
      }

      function saveXhtmlIfChanged() {
        if (xhtmlHasBeenChanged()) {
          $scope.item.xhtml = $scope.xhtml;
          ItemService.saveXhtml($scope.item.xhtml, function() {
            $log.info('xhtml saved');
          });
          Msgr.send('itemChanged', {partChanged: 'xhtml'});
        }
      }

      function componentsHaveBeenChanged(){
        return $scope.item && !_.isUndefined($scope.components) && !_.isEqual($scope.item.components, $scope.components);
      }

      function saveComponentsIfChanged() {
        if (componentsHaveBeenChanged()) {
          $scope.item.components = $scope.components;
          ItemService.saveComponents($scope.item.components, function() {
            $log.info('components saved');
          });
          Msgr.send('itemChanged', {partChanged: 'components'});
        }
      }

      function customScoringHasBeenChanged(){
        return $scope.item && $scope.item.customScoring !== $scope.customScoringJs;
      }

      function saveCustomScoringIfChanged() {
        if (customScoringHasBeenChanged()){
          $scope.item.customScoring = $scope.customScoringJs;
          ItemService.saveCustomScoring($scope.item.customScoring, function() {
            $log.info('custom scoring saved');
          });
          Msgr.send('itemChanged', {partChanged: 'customScoring'});
        }
      }

      function aceJsonChanged() {
        try {
          var update = JSON.parse($scope.json);
          $scope.components = update;
        } catch (e) {
          $log.error('There was a problem parsing $scope.json', e);
        }
      }

      function registerComponent(event, id, componentBridge, componentElement) {
        ComponentData.registerComponent(id, componentBridge, componentElement);
      }
    }
  ]);