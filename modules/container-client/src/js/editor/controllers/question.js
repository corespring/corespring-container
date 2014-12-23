angular.module('corespring-editor.controllers')
  .controller('QuestionController', [
    '$scope',
    '$element',
    '$timeout',
    'ItemService',
    'EditorConfig',
    'LogFactory',
    'ComponentImageService',
    'ComponentData',
    'ComponentPopups',
    'AppState',
    'ScoringHandler',
    function($scope,
      $element,
      $timeout,
      ItemService,
      EditorConfig,
      LogFactory,
      ComponentImageService,
      ComponentData,
      ComponentPopups,
      AppState,
      ScoringHandler) {

      var configPanels = {};

      var logger = LogFactory.getLogger('question-controller');

      $scope.previewOn = AppState.question.preview || false;

      $scope.$watch('previewOn', function(){
        AppState.question.preview = $scope.previewOn;
      });

      $scope.showSummaryFeedback = false;

      $scope.togglePreview = function() {
        $scope.previewOn = !$scope.previewOn;
      };

      $scope.scoring = function(){
        ScoringHandler.scoring($scope.item.components, $scope.item.xhtml, function(){
          saveComponents();
        });
      };

      $scope.$on('edit-node', function($event, id, model, config){
        ComponentPopups.launch($scope, id, model, config);
      });

      $scope.imageService = ComponentImageService;
      $scope.overrideFeatures = EditorConfig.overrideFeatures;
      $scope.extraFeatures = EditorConfig.extraFeatures;


      // Dropdowns in wiggi-wiz toolbar don't trigger when bootstrap is imported?
      $timeout(function() {
        $('.wiggi-wiz-toolbar button', $element).dropdown();
      });

      $scope.getUploadUrl = function(file) {
        throw new Error('deprecated');
      };

      $scope.selectFile = function(file) {
        throw new Error('deprecated');
      };

      $scope.$on('fileSizeGreaterThanMax', EditorConfig.onFileSizeGreaterThanMax);

      $scope.$on('registerComponent', function(event, id, componentBridge) {
        logger.debug('registerComponent ', id);
        ComponentData.registerComponent(id, componentBridge);
      });

      $scope.$on('registerPlaceholder', function(event, id, placeholder) {
        logger.debug('registerPlaceholder ', id);
        ComponentData.registerPlaceholder(id, placeholder);
      });

      $scope.$on('registerConfigPanel', function(a, id, component) {
        logger.debug('registerConfigPanel', id);
        configPanels[id] = component;
        component.setModel($scope.item.components[id]);
        if (_.isFunction(component.setProfile)) {
          component.setProfile($scope.item.profile);
        }
      });

      $scope.onItemSaved = function(){

      };

      function saveComponents(){
        logger.debug('[saveComponents]');
        ItemService.fineGrainedSave(
          {components: $scope.serialize($scope.item.components)},
          $scope.onItemSaved,
          $scope.onItemSaveError);
      }

      $scope.$on('itemAdded', function(event, $node) {
        // This ends up in some weird race condition if we don't wrap it in a $timeout
        $timeout(function() {
          angular.element('.wiggi-wiz', $element).scope().focusCaretAtEnd();
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

      $scope.$watch('item.components', debounce(function(newComps, oldComps){

        if(_.isEqual(newComps, oldComps)){
          logger.debug('they are the same - ignore...');
          return;
        }
        saveComponents();
      }), true);

      $scope.$watch('item.xhtml', debounce(function(oldValue, newValue) {
        logger.debug('old', oldValue);
        if (oldValue !== newValue) {
          ItemService.fineGrainedSave({
            'xhtml': $scope.item.xhtml
          }, function(result) {});
        }
      }));

      $scope.$watch('item.summaryFeedback', debounce(function(oldValue,
        newValue) {
        logger.debug('old', oldValue);
        if (oldValue !== newValue) {
          ItemService.fineGrainedSave({
            'summaryFeedback': $scope.item.summaryFeedback
          }, function(result) {});
        }
      }));

      function debounce(fn) {
        return _.debounce(fn, 500, {
          trailing: true,
          leading: false
        });
      }

      ItemService.load(function(item){
        $scope.item = item;
        ComponentData.setModel(item.components);
      });

    }
  ]);
