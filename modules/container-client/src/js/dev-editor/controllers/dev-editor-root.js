angular.module('corespring-dev-editor.controllers')
  .controller('DevEditorRoot', [
    '$log',
    '$scope',
    '$timeout',
    'ComponentData',
    'iFrameService',
    'ItemService',
    'Msgr',
    function (
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
        scoring: false,
        files: false,
        player: true
      };

      $scope.aceJsonChanged = aceJsonChanged;
      $scope.onItemLoaded = onItemLoaded;
      $scope.onItemLoadError = onItemLoadError;
      $scope.save = save;
      $scope.saveAll = saveAll;

      var debounceUpdateItemChanged = _.debounce(updateItemChanged, 100, { leading: false, trailing: true });
      $scope.$watch('components', debounceUpdateItemChanged);
      $scope.$watch('customScoringJs', debounceUpdateItemChanged);
      $scope.$watch('xhtml', debounceUpdateItemChanged);

      $scope.$on('registerComponent', registerComponent);

      $scope.$on('assetUploadCompleted', function () {
        Msgr.send('itemChanged', { partChanged: 'item' });
        ItemService.load(function (item) {
          $scope.item.files = item.files;
        }, $scope.onItemLoadError, true);
      });

      $scope.$on('assetDeleteCompleted', function () {
        Msgr.send('itemChanged', { partChanged: 'item' });
      });

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

        Msgr.on('saveAll', function (data, done) {
          $log.debug('received \'saveAll\' event');
          saveAll(done || function () { });
        });

        function onInitialise(data) {
          $log.debug('on initialise', data);
          $scope.initialData = data;
          ItemService.load($scope.onItemLoaded, $scope.onItemLoadError);
          Msgr.send('rendered');
        }
      }

      function getError(report) {
        var orphans = _(report).map(function (r) {
          if (!r.markup || !r.json) {
            return r.id;
          }
        }).compact().value();

        if (_.isEmpty(orphans)) {
          return undefined;
        } else {
          return "The following items in the JSON are missing ids in the xhtml: " + orphans.join(', ');
        }
      }

      function getIdsInMarkup() {
        function getId(i, node) {
          return node.id;
        }

        var $node = $('<div>' + ($scope.xhtml || '').toString() + '</div>');
        var ids = $node.find('*').map(getId).get();
        console.log('ids:', ids);
        ids = _.reject(ids, _.isEmpty);
        console.log('ids: filtered', ids);
        return ids;
      }

      function getMatches() {
        //1. 
        var idsInMarkup = getIdsInMarkup();
        var idsInJson = _.keys($scope.components);
        console.log('ids in markup: ', idsInMarkup);
        console.log('ids in json: ', idsInJson);
        var allIds = _(idsInJson).concat(idsInMarkup).uniq().value();
        console.log('all ids: ', allIds);

        var out = _.map(allIds, function (id) {
          return {
            id: id,
            markup: _.contains(idsInMarkup, id),
            json: _.contains(idsInJson, id)
          }
        });

        console.log('out: ', out);
        return out;
      }

      function idInMarkup(id) {
        return getIdsInMarkup().indexOf(id) !== -1;
      }

      function idInJson(id) {
        return _($scope.components).keys().contains(id);
      }

      function updateItemChanged() {

        console.log('item changed...');
        console.log('html:', $scope.xhtml);
        console.log('components:', $scope.components);

        var matchReport = getMatches();

        var validIds = _(matchReport).filter(function (r) {
          return (r.markup && r.json);
        }).map(function (r) {
          return r.id;
        }).value();

        console.log('valid ids: ', validIds);

        ComponentData.normalize(validIds);


        var error = getError(matchReport);
        if (_.isEmpty(error)) {
          console.log('sending clear');
          Msgr.send('clearItemError', {});
        } else {
          console.log('sending error');
          Msgr.send('itemError', error);
        }

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
        if (partsChanged.length) {
          Msgr.send('itemChanged', { partsChanged: partsChanged });
        }
      }

      function onItemLoaded(item) {
        $scope.item = item;
        $scope.xhtml = item.xhtml;
        $scope.json = JSON.stringify(item.components, undefined, 2);
        $scope.customScoringJs = item.customScoring;
        $scope.components = _.cloneDeep(item.components);
        ComponentData.setModel($scope.components);
        ComponentData.setEditable(true);
      }

      function onItemLoadError(err) {
        window.alert("There was an error. Please try later. Thanks!");
      }

      function saveAll(done) {
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
        ItemService.saveAll($scope.item, function () {
          $log.debug('call \'saveAll\' callback...');
          done(null, { saved: true });
        });
      }

      function save() {
        saveXhtmlIfChanged();
        saveComponentsIfChanged();
        saveCustomScoringIfChanged();
      }

      function xhtmlHasBeenChanged() {
        return $scope.item && $scope.xhtml !== $scope.item.xhtml;
      }

      function saveXhtmlIfChanged() {
        if (xhtmlHasBeenChanged()) {
          $scope.item.xhtml = $scope.xhtml;
          ItemService.saveXhtml($scope.item.xhtml, function () {
            $log.info('xhtml saved');
          });
          Msgr.send('itemChanged', { partChanged: 'xhtml' });
        }
      }

      function componentsHaveBeenChanged() {
        return $scope.item && !_.isUndefined($scope.components) && !_.isEqual($scope.item.components, $scope.components);
      }

      function saveComponentsIfChanged() {
        if (componentsHaveBeenChanged()) {
          $scope.item.components = $scope.components;
          ItemService.saveComponents($scope.item.components, function () {
            $log.info('components saved');
          });
          Msgr.send('itemChanged', { partChanged: 'components' });
        }
      }

      function customScoringHasBeenChanged() {
        return $scope.item && $scope.item.customScoring !== $scope.customScoringJs;
      }

      function saveCustomScoringIfChanged() {
        if (customScoringHasBeenChanged()) {
          $scope.item.customScoring = $scope.customScoringJs;
          ItemService.saveCustomScoring($scope.item.customScoring, function () {
            $log.info('custom scoring saved');
          });
          Msgr.send('itemChanged', { partChanged: 'customScoring' });
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

        if (idInJson(id) && idInMarkup(id)) {
          ComponentData.registerComponent(id, componentBridge, componentElement);
        } else {
          pendingComponents[id] = {
            bridge: componentBridge,
            element: componentElement
          }
        }
      }
    }
  ]);