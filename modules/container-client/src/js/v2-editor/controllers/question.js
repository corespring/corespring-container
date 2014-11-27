angular.module('corespring-editor.controllers')
  .controller('QuestionController', [
    '$scope',
    '$modal',
    '$element',
    '$timeout',
    'ItemService',
    'LogFactory',
    'DesignerService',
    'ImageFeature',
    'WiggiFootnotesFeatureDef',
    'WiggiMathJaxFeatureDef',
    'WiggiLinkFeatureDef',
    'ComponentImageService',
    'ComponentToWiggiwizFeatureAdapter',
    'ComponentData',
    function($scope,
      $modal,
      $element,
      $timeout,
      ItemService,
      LogFactory,
      DesignerService,
      ImageFeature,
      WiggiFootnotesFeatureDef,
      WiggiMathJaxFeatureDef,
      WiggiLinkFeatureDef,
      ComponentImageService,
      ComponentToWiggiwizFeatureAdapter,
      ComponentData) {

      var logger = LogFactory.getLogger('QuestionController');

      $scope.previewOn = false;
      $scope.showSummaryFeedback = false;

      $scope.togglePreview = function() {
        $scope.previewOn = !$scope.previewOn;
      };

      $scope.scoring = function() {
        var modalInstance = $modal.open({
          templateUrl: '/templates/popups/scoring',
          controller: 'ScoringPopupController',
          size: 'lg',
          backdrop: 'static',
          resolve: {
            components: function() {
              var typeAndWeights = _.mapValues($scope.item.components,
                function(v) {
                  return {
                    componentType: v.componentType,
                    weight: v.weight
                  };
                });
              return typeAndWeights;
            },
            xhtml: function() {
              return $scope.item.xhtml;
            }
          }
        });

        function weightsDiffer(a, b) {
          for (var x in a) {
            if (a[x].weight !== b[x].weight) {
              return true;
            }
          }
          return false;
        }

        function onScoringComplete(typeAndWeights) {
          logger.debug('scoring ok-ed - save');

          if (weightsDiffer(typeAndWeights, $scope.item.components)) {
            _.forIn($scope.item.components, function(comp, key) {
              comp.weight = typeAndWeights[key].weight;
            });

            logger.debug('weights are different - save');
            //TODO - only update the weights?
            ItemService.fineGrainedSave({
              components: $scope.item.components
            }, function(item) {
              $scope.item.components = item.components;
            });
          }
        }

        function onScoringDismiss() {
          logger.debug('scoring dismissed');
        }

        modalInstance.result.then(onScoringComplete, onScoringDismiss);
      };

      var configPanels = {};

      $scope.removedComponents = {};

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

          var newComponentId = ComponentData.addComponent(component.defaultData);

          addContent($([
            '<placeholder',
            ' id="' + newComponentId + '"',
            ' component-type="' + component.componentType + '"',
            ' label="' + component.name + '"',
            '>'
          ].join('')));
        }

        function deleteComponent(id) {
          ComponentData.deleteComponent(id);
        }

        function reAddToEditor($node) {
          var id = $($node).attr('id');
          ComponentData.restoreComponent(id);
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

        var videoComponent = componentToFeature(_.find($scope.widgets,
          function(c) {
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
          definitions: [{
            name: 'external',
            type: 'dropdown',
            dropdownTitle: 'Answer Type',
            buttons: _($scope.interactions)
              .reject(isToolbar)
              .sortBy(orderList)
              .map(componentToFeature)
              .value()
          }, {
            type: 'group',
            buttons: [
              new WiggiMathJaxFeatureDef()
            ]
          }, {
            type: 'group',
            buttons: [
              new WiggiFootnotesFeatureDef()
            ]
          }, {
            type: 'group',
            buttons: [
              videoComponent
            ]
          }]
        };
      }

      function onComponentsLoadError(error) {
        throw new Error("Error loading components");
      }

      $scope.getUploadUrl = function(file) {
        logger.log('getUploadUrl', arguments);
        return file.name;
      };

      $scope.selectFile = function(file) {
        logger.log('selectFile', 'root select file...');
        $scope.selectedFile = file;
        logger.log('selectFile', $scope.selectedFile);
      };

      $scope.$on('fileSizeGreaterThanMax', function(event) {
        logger.warn("file too big");
      });

      $scope.$on('registerComponent', function(event, id, componentBridge) {
        logger.debug('registerComponent ', id);
        ComponentData.registerComponent(id, componentBridge);
      });

      $scope.$on('registerPlaceholder', function(event, id, placeholder) {
        logger.debug('registerPlaceholder ', id);
        ComponentData.registerPlaceholder(id, placeholder);
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
        logger.log('Saving...');
        var cleaned = $scope.serialize($scope.item.components);
        /*for (var key in cleaned) {
          if (!ComponentRegister.hasComponent(key)) {
            delete cleaned[key];
          }
        }*/
        throw new Error('refactoring');
        /*ItemService.save({
            components: cleaned,
            xhtml: $scope.item.xhtml,
            summaryFeedback: $scope.isSummaryFeedbackSelected ? $scope.item.summaryFeedback : ""
          },
          $scope.onItemSaved,
          $scope.onItemSaveError,
          $scope.itemId);*/
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
        throw new Error('todo..');
        //MathJaxService.parseDomForMath();
      });

      $scope.isSummaryFeedbackSelected = false;

      $scope.$watch("isSummaryFeedbackSelected", function(newValue, oldValue) {
        if (!newValue && newValue !== oldValue) {
          $scope.item.summaryFeedback = "";
        }
      });

      $scope.$watch('item.xhtml', throttle(function(oldValue, newValue) {
        logger.debug('old', oldValue);
        if (oldValue !== newValue) {
          ItemService.fineGrainedSave({
            'xhtml': $scope.item.xhtml
          }, function(result) {});
        }
      }));

      $scope.$watch('item.summaryFeedback', throttle(function(oldValue,
        newValue) {
        logger.debug('old', oldValue);
        if (oldValue !== newValue) {
          ItemService.fineGrainedSave({
            'summaryFeedback': $scope.item.summaryFeedback
          }, function(result) {});
        }
      }));

      function throttle(fn) {
        return _.throttle(fn, 500, {
          trailing: true,
          leading: false
        });
      }

      DesignerService.loadAvailableUiComponents(onComponentsLoaded,
        onComponentsLoadError);

      ItemService.load(function(item){
        $scope.item = item;
        ComponentData.setModel(item.components);
      });

    }
  ]);
