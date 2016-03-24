angular.module('corespring-editor.controllers')
  .controller('QuestionController', [
    '$scope',
    '$element',
    '$timeout',
    'EditorChangeWatcher',
    'ItemService',
    'EditorConfig',
    'LogFactory',
    'EditingImageService',
    'ComponentData',
    'ComponentPopups',
    'AppState',
    'ScoringHandler',
    'MathJaxService',
    'WiggiLinkFeatureDef',
    'WiggiMathJaxFeatureDef',
    'EDITOR_EVENTS',
    function($scope,
      $element,
      $timeout,
      EditorChangeWatcher,
      ItemService,
      EditorConfig,
      LogFactory,
      EditingImageService,
      ComponentData,
      ComponentPopups,
      AppState,
      ScoringHandler,
      MathJaxService,
      WiggiLinkFeatureDef,
      WiggiMathJaxFeatureDef,
      EDITOR_EVENTS) {

      var configPanels = {};

      var logger = LogFactory.getLogger('question-controller');

      $scope.previewOn = AppState.question.preview || true;

      $scope.$watch('previewOn', function() {
        AppState.question.preview = $scope.previewOn;
      });

      $scope.showSummaryFeedback = false;

      $scope.togglePreview = function() {
        $scope.previewOn = !$scope.previewOn;
      };

      $scope.scoring = function() {
        ScoringHandler.scoring($scope.item.components, $scope.item.xhtml,
          function() {
            saveXhtmlAndComponents();
          });
      };

      $scope.$on('edit-node', function($event, id, model, config) {
        ComponentPopups.launch($scope, id, model, config);
      });

      $scope.imageService = EditingImageService;
      $scope.overrideFeatures = EditorConfig.overrideFeatures;
      $scope.extraFeatures = EditorConfig.extraFeatures;
      $scope.extraFeaturesForFeedback = {
        definitions: [
            new WiggiMathJaxFeatureDef(),
            new WiggiLinkFeatureDef()
        ]
      };
      $scope.onEditorClick = onEditorClick;

      // Dropdowns in wiggi-wiz toolbar don't trigger when bootstrap is imported?
      $timeout(function() {
        $('.wiggi-wiz-toolbar button', $element).dropdown();
      });

      function deprecated() {
        throw new Error('deprecated');
      }

      $scope.getUploadUrl = deprecated;
      $scope.selectFile = deprecated;

      function onEditorClick() {
        $scope.$broadcast('editor.click');
      }

      $scope.$on('fileSizeGreaterThanMax', EditorConfig.onFileSizeGreaterThanMax);

      $scope.$on('registerComponent', function(event, id, componentBridge,
        componentElement) {
        logger.debug('registerComponent ', id);
        ComponentData.registerComponent(id, componentBridge, componentElement);
      });

      $scope.$on('registerPlaceholder', function(event, id, placeholder) {
        logger.debug('registerPlaceholder ', id);
        ComponentData.registerPlaceholder(id, placeholder);
      });

      $scope.$on('registerConfigPanel', function(a, id, configPanelBridge) {
        logger.debug('registerConfigPanel', id);
        configPanels[id] = configPanelBridge;
        var componentModel = $scope.item.components[id];
        configPanelBridge.setModel(componentModel);
        if (_.isFunction(configPanelBridge.setProfile)) {
          configPanelBridge.setProfile($scope.item.profile);
        }
      });

      $scope.onItemSaved = function() {};

      var saveXhtmlAndComponents = EditorChangeWatcher.debounce(function(){
        ItemService.saveXhtmlAndComponents(
          $scope.item.xhtml,
          $scope.serialize($scope.item.components),
          $scope.onItemSaved,
          $scope.onItemSaveError);
      }, 300);

      $scope.getWiggiWizElement = function() {
        return angular.element('.wiggi-wiz', $element);
      };

      $scope.$on('itemChanged', function(event, $node) {
        $scope.$broadcast(EDITOR_EVENTS.CONTENT_ADDED_TO_EDITOR);
      });

      $scope.serialize = function(comps) {
        if (!configPanels) {
          return comps;
        }

        var newModel = _.cloneDeep(comps);

        function storeComponentModelInNewModel(value, key) {
          var configPanel = configPanels[key];
          if (configPanel && configPanel.getModel) {
            newModel[key] = configPanel.getModel();
          }
        }

        _.each(comps, storeComponentModelInNewModel);

        return newModel;
      };

      var makeWatcher = EditorChangeWatcher.makeWatcher;

      $scope.$watch(
        'item.components', 
        makeWatcher('components', saveXhtmlAndComponents, $scope),
        true);

      $scope.$watch(
        'item.xhtml', 
        makeWatcher('xhtml', function(n,o){
          ItemService.saveXhtmlAndComponents(n);
        }, $scope)); 

      $scope.$watch(
        'item.summaryFeedback', 
        makeWatcher('summaryFeedback', function(n,o){
          ItemService.saveSummaryFeedback(n);
        }, $scope));

      ItemService.load(function(item) {
        $scope.item = item;
        ComponentData.setModel(item.components);
        MathJaxService.parseDomForMath(100);
      });

    }
  ]);