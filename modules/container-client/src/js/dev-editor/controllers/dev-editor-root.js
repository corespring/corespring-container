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
      Msgr) {

      $scope.aceJsonChanged = aceJsonChanged;
      $scope.onItemLoaded = onItemLoaded;
      $scope.onItemLoadError = onItemLoadError;
      $scope.save = save;

      $scope.$on('registerComponent', registerComponent);

      init();

      //-----------------------------------------

      function init() {
        ItemService.load($scope.onItemLoaded, $scope.onItemLoadError);

        if (iFrameService.isInIFrame() && !iFrameService.bypassIframeLaunchMechanism()) {
          Msgr.on('initialise', function(data) {
            $log.log('on initialise', data);
            Msgr.send('rendered');
          });

          //send msg "ready" to instance
          //this will result in msg "initialise" being sent back to us
          $log.log('sending ready');
          Msgr.send('ready');
        }
      }

      function onItemLoaded(item) {
        //PE-221 This event may arrive outside of the angular update cycle
        //The angular timeout calls apply on the next occasion
        $timeout(function() {
          $scope.item = item;
          ComponentData.setModel(item.components);
          $scope.xhtml = item.xhtml;
          $scope.json = JSON.stringify(item.components, undefined, 2);
          $scope.customScoringJs = item.customScoring;
          $scope.components = _.cloneDeep(item.components);
        });
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
          ItemService.saveXhtml($scope.item.xhtml, function () {
            $log.info('xhtml saved');
          });
        }
      }

      function saveComponentsIfChanged() {
        if (!_.isUndefined($scope.components) && !_.isEqual($scope.item.components, $scope.components)) {
          $scope.item.components = $scope.components;
          ItemService.saveComponents($scope.item.components, function () {
            $log.info('components saved');
          });
        }
      }

      function saveCustomScoringIfChanged(){
        if ($scope.item.customScoring !== $scope.customScoringJs) {
          $scope.item.customScoring = $scope.customScoringJs;
          ItemService.saveCustomScoring($scope.item.customScoring, function() {
            $log.info('custom scoring saved');
          });
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