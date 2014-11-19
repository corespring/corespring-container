angular.module('corespring-editor.controllers').controller('QuestionController', [
  '$scope',
  '$modal',
  'ItemService',
  'LogFactory',
  '$element',
  '$http',
  '$timeout',
  '$stateParams',
  'ComponentRegister',
  'ComponentToWiggiwizFeatureAdapter',
  'DesignerService',
  'ImageFeature',
  'ImageUtils',
  'MathJaxService',
  'WiggiFootnotesFeatureDef',
  'WiggiMathJaxFeatureDef',
  'WiggiLinkFeatureDef',
  'ComponentImageService',
  function(
    $scope, 
    $modal, 
    ItemService, 
    LogFactory, 
    $element,
    $http,
    $timeout,
    $stateParams,
    ComponentRegister,
    ComponentToWiggiwizFeatureAdapter,
    DesignerService,
    ImageFeature,
    ImageUtils,
    MathJaxService,
    WiggiFootnotesFeatureDef,
    WiggiMathJaxFeatureDef,
    WiggiLinkFeatureDef,
    ComponentImageService){

    var logger = LogFactory.getLogger('QuestionController');

    $scope.previewOn = false;
    
    

    $scope.togglePreview = function(){
      $scope.previewOn = !$scope.previewOn;
    };

    $scope.scoring = function(){
      var modalInstance = $modal.open({
        templateUrl: '/templates/popups/scoring',
        controller: 'ScoringPopupController',
        size: 'lg',
        backdrop:'static' 
      });

      modalInstance.result.then(function () {
        logger.debug('Modal ok with', arguments);
      }, function () {
        logger.debug('Modal dismissed at: ' + new Date());
      });
    };

    var configPanels = {};

    var $log = LogFactory.getLogger('designer');

    $log.log($stateParams);

    $scope.removedComponents = {};

    $scope.section = $stateParams.section;

    $scope.editorMode = "visual";

    $scope.imageService = ComponentImageService;

    function onComponentsLoaded(uiComponents) {
      $scope.interactions = uiComponents.interactions;
      $scope.widgets = uiComponents.widgets;
      initComponents();
    }

    // Dropdowns in wiggi-wiz toolbar don't trigger when bootstrap is imported?
    $timeout(function() {
      $('.wiggi-wiz-toolbar button', $element).dropdown();
    });

    function initComponents() {

      if (!$scope.interactions || !$scope.widgets) {
        return;
      }

      function addToEditor(editor, addContent, component) {
        $scope.lastId++;

        var defaults = {
          weight: 1,
          clean: true
        };

        var newData = _.extend(defaults, _.cloneDeep(component.defaultData));

        $scope.item.components[$scope.lastId] = newData;

        addContent($([
          '<placeholder',
            ' id="' + $scope.lastId + '"',
            ' component-type="' + component.componentType + '"',
            ' label="' + component.name + '"',
          '>'
        ].join('')));
      }

      function deleteComponent(id) {
        if ($scope.item && $scope.item.components) {
          ComponentRegister.deleteComponent(id);
          $scope.removedComponents[id] = _.cloneDeep($scope.item.components[id]);
          delete $scope.item.components[id];
        } else {
          throw 'Can\'t delete component with id ' + id;
        }
      }

      function reAddToEditor($node) {
        var id = $($node).attr('id');
        $scope.item.components[id] = $scope.removedComponents[id];
      }

      function componentToFeature(component) {
        return ComponentToWiggiwizFeatureAdapter.componentToWiggiwizFeature(
          component,
          addToEditor,
          deleteComponent,
          reAddToEditor
        );
      }

      var orderedComponents = [
        "corespring-multiple-choice",
        "corespring-inline-choice",
        "corespring-focus-task",
        "corespring-ordering",
        "corespring-drag-and-drop",
        "corespring-text-entry",
        "corespring-extended-text-entry",
        "corespring-point-intercept",
        "corespring-line",
        "corespring-function-entry",
        "corespring-select-text"
      ];

      function orderList(component) {
        var idx = _.indexOf(orderedComponents, component.componentType);
        return idx >= 0 ? idx : 1000;
      }

      function isToolbar(component) {
        return component.titleGroup === 'toolbar';
      }

      var videoComponent = componentToFeature(_.find($scope.widgets, function(c) {
        return c.componentType === 'corespring-video';
      }));

      videoComponent.iconclass = "fa fa-film";

      $scope.overrideFeatures = [
        ImageFeature
      ];

      var linkFeatureGroup = {
        type: 'group',
        buttons: [
          new WiggiLinkFeatureDef()
        ]
      };

      $scope.linkFeature = {
        definitions: [linkFeatureGroup]
      };

      $scope.extraFeatures = {
        definitions: [
          {
            name: 'external',
            type: 'dropdown',
            dropdownTitle: 'Answer Type',
            buttons: _($scope.interactions).reject(isToolbar).sortBy(orderList).map(componentToFeature).value()
          },
          {
            type: 'group',
            buttons: [
              new WiggiMathJaxFeatureDef()
            ]
          },
          {
            type: 'group',
            buttons: [
              new WiggiFootnotesFeatureDef()
            ]
          },
          {
            type: 'group',
            buttons: [
              videoComponent
            ]
          }
        ]};
    }

    function onComponentsLoadError(error) {
      throw new Error("Error loading components");
    }

    $scope.getUploadUrl = function(file) {
      $log.log('getUploadUrl', arguments);
      return file.name;
    };

    $scope.selectFile = function(file) {
      $log.log('selectFile', 'root select file...');
      $scope.selectedFile = file;
      $log.log('selectFile', $scope.selectedFile);
    };

    $scope.$on('fileSizeGreaterThanMax', function(event) {
      $log.warn("file too big");
    });


    $scope.$on('registerConfigPanel', function(a, id, component) {
      configPanels[id] = component;
      component.setModel($scope.item.components[id]);
      if (_.isFunction(component.setProfile)) {
        component.setProfile($scope.item.profile);
      }
    });

    $scope.$on('save-data', function(event) {
      $scope.save();
    });

    $scope.$on('itemAdded', function(event, $node) {
      // This ends up in some weird race condition if we don't wrap it in a $timeout
      $timeout(function() {
        angular.element('.wiggi-wiz', $element).scope().focusCaretAtEnd();
      });
    });

    $scope.save = function(callback) {
      $log.log('Saving...');
      var cleaned = $scope.serialize($scope.item.components);
      for (var key in cleaned) {
        if (!ComponentRegister.hasComponent(key)) {
          delete cleaned[key];
        }
      }
      ItemService.save({
          components: cleaned,
          xhtml: $scope.item.xhtml,
          summaryFeedback: $scope.isSummaryFeedbackSelected ? $scope.item.summaryFeedback : ""
        },
        $scope.onItemSaved,
        $scope.onItemSaveError,
        $scope.itemId);
    };

    $scope.serialize = function(comps) {
      if (!configPanels) {
        return comps;
      }

      var newModel = _.cloneDeep(comps);

      function storeComponentModelInNewModel(value, key) {
        var component = configPanels[key];
        if (component && component.getModel) {
          newModel[key] = component.getModel();
        }
      }

      _.each(comps, storeComponentModelInNewModel);

      return newModel;
    };

    $scope.$on('mathJaxUpdateRequest', function() {
      MathJaxService.parseDomForMath();
    });

    $scope.isSummaryFeedbackSelected = false;

    function updateSummaryFeedback(item) {
      $scope.isSummaryFeedbackSelected = !!item.summaryFeedback;
    }

    $scope.$watch("isSummaryFeedbackSelected", function(newValue, oldValue) {
      if (!newValue && newValue !== oldValue) {
        $scope.item.summaryFeedback = "";
      }
    });

    function preprocessComponents(item) {
      _.each(item.components, function(c, key) {
        var serverLogic = corespring.server.logic(c.componentType);
        if (serverLogic.preprocess) {
          //TODO: This is part of a larger task to add preprocess to the container
          //@see: https://thesib.atlassian.net/browse/CA-842
          item.components[key] = serverLogic.preprocess(c);
        }
      });
    }

    function sizeToString(size) {
      if (size > 1) {
        return 'many';
      } else if (size === 1) {
        return 'one';
      } else {
        return 'none';
      }
    }

    $scope.componentSize = sizeToString(0);

    $scope.$watch('item.components', function(components) {
      $scope.componentSize = sizeToString(_.size(components));
    });

    DesignerService.loadAvailableUiComponents(onComponentsLoaded, onComponentsLoadError);

    ItemService.load(function(item){
      $scope.item = item; 
      preprocessComponents(item);
      updateSummaryFeedback(item);
      var max = 0;
      $('<div>' + $scope.item.xhtml + '</div>').find('[id]').each(function(idx, element) {
        var id = Number($(element).attr('id'));
        if (id > max) {
          max = id;
        }
      });
      $scope.lastId = max;
    },function(){
      logger.error('error loading');
    });
  }
  ]);