angular.module('corespring-editor.controllers')
  .controller('QuestionController', [
    '$scope',
    '$element',
    '$timeout',
    'debounce',
    'ItemService',
    'EditorConfig',
    'LogFactory',
    'ComponentImageService',
    'ComponentData',
    'ComponentPopups',
    'AppState',
    'ScoringHandler',
    'MathJaxService',
    'WiggiLinkFeatureDef',
    'WiggiMathJaxFeatureDef',
    function($scope,
      $element,
      $timeout,
      debounce,
      ItemService,
      EditorConfig,
      LogFactory,
      ComponentImageService,
      ComponentData,
      ComponentPopups,
      AppState,
      ScoringHandler,
      MathJaxService,
      WiggiLinkFeatureDef,
      WiggiMathJaxFeatureDef) {

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
            saveComponents();
          });
      };

      $scope.$on('edit-node', function($event, id, model, config) {
        ComponentPopups.launch($scope, id, model, config);
      });

      $scope.imageService = ComponentImageService;
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

      function saveComponents() {
        logger.debug('[saveComponents]');
        ItemService.saveComponents(
          $scope.serialize($scope.item.components),
          $scope.onItemSaved,
          $scope.onItemSaveError);
      }

      $scope.getWiggiWizElement = function() {
        return angular.element('.wiggi-wiz', $element);
      };

      $scope.$on('itemAdded', function(event, $node) {
        // This ends up in some weird race condition if we don't wrap it in a $timeout
        $timeout(function() {
          $scope.getWiggiWizElement().scope().focusCaretAtEnd();
        });
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

      var debouncedSaveComponents = debounce(function(newComps, oldComps) {
        saveComponents();
        if (oldComps) {
          $scope.$emit('itemChanged', {
            partChanged: 'components'
          });
        }
      });

      var debouncedSaveXhtml = debounce(function(newValue, oldValue) {
        ItemService.saveXhtml(newValue);
        if (oldValue) {
          $scope.$emit('itemChanged', {
            partChanged: 'xhtml'
          });
        }
      });

      var debouncedSaveSummaryFeedback = debounce(function(newValue, oldValue) {
        ItemService.saveSummaryFeedback(newValue);
        if (oldValue) {
          $scope.$emit('itemChanged', {
            partChanged: 'summaryFeedback'
          });
        }
      });

      $scope.$watch('item.components', function(newComps, oldComps) {
        if (_.isEqual(newComps, oldComps)) {
          logger.debug('they are the same - ignore...');
          return;
        }
        debouncedSaveComponents(newComps, oldComps);
      }, true);

      $scope.$watch('item.xhtml', function(newValue, oldValue) {
        logger.debug('old', oldValue);
        if (oldValue !== newValue) {
          debouncedSaveXhtml(newValue, oldValue);
        }
      });

      $scope.$watch('item.summaryFeedback', function(newValue, oldValue) {
        logger.debug('old', oldValue);
        if (oldValue !== newValue) {
          debouncedSaveSummaryFeedback(newValue, oldValue);
        }
      });

      ItemService.load(function(item) {
        $scope.item = item;
        ComponentData.setModel(item.components);
        MathJaxService.parseDomForMath(100);
      });

    }
  ]);