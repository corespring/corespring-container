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

      $scope.$on('registerComponent', registerComponent);

      init();

      //-----------------------------------------

      function init() {
        if (iFrameService.isInIFrame() && !iFrameService.bypassIframeLaunchMechanism()) {
          Msgr.on('initialise', onInitialise);
          //send msg "ready" to instance
          //this will result in msg "initialise" being sent back to us
          $log.log('sending ready');
          Msgr.send('ready');
        } else {
          ItemService.load($scope.onItemLoaded, $scope.onItemLoadError);
        }

        function onInitialise(data) {
          $log.log('on initialise', data);
          ItemService.load($scope.onItemLoaded, $scope.onItemLoadError);
          Msgr.send('rendered');
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

      function save() {
        saveXhtmlIfChanged();
        saveComponentsIfChanged();
        saveCustomScoringIfChanged();
      }

      function saveXhtmlIfChanged() {
        if ($scope.xhtml !== $scope.item.xhtml) {
          $scope.item.xhtml = $scope.xhtml;
          ItemService.saveXhtml($scope.item.xhtml, function() {
            $log.info('xhtml saved');
          });
          Msgr.send('itemChanged', {partChanged: 'xhtml'});
        }
      }

      function saveComponentsIfChanged() {
        if (!_.isUndefined($scope.components) && !_.isEqual($scope.item.components, $scope.components)) {
          $scope.item.components = $scope.components;
          ItemService.saveComponents($scope.item.components, function() {
            $log.info('components saved');
          });
          Msgr.send('itemChanged', {partChanged: 'components'});
        }
      }

      function saveCustomScoringIfChanged() {
        if ($scope.item.customScoring !== $scope.customScoringJs) {
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