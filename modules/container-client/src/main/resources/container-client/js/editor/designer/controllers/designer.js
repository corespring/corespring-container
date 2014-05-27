(function() {

  angular.module('corespring-editor.controllers')
    .controller('Designer', ['$scope',
      '$element',
      '$compile',
      '$http',
      '$modal',
      '$log',
      '$stateParams',
      'DesignerService',
      'ItemService',
      'MathJaxService',
      'ComponentToWiggiwizFeatureAdapter',
      'ImageUtils',
      'ComponentRegister',
      'WiggiWizHelper',
      'WiggiMathJaxFeatureDef',
      'ImageFeature',
      DesignerController
    ]);

  /* global AddContentModalController, com */
  function DesignerController($scope, $element, $compile, $http, $modal, $log, $stateParams, DesignerService, ItemService, MathJaxService, ComponentToWiggiwizFeatureAdapter, ImageUtils, ComponentRegister, WiggiWizHelper, WiggiMathJaxFeatureDef, ImageFeature) {

    var configPanels = {};

    var log = $log.debug.bind($log, '[designer] - ');

    log($stateParams);

    $scope.section = $stateParams.section;

    $scope.editorMode = "visual";

    $scope.imageService = {

      deleteFile: function(url) {
        $http['delete'](url);
      },
      addFile: function(file, onComplete, onProgress) {
        var url = '' + file.name;

        if (ImageUtils.bytesToKb(file.size) > 500) {
          onComplete(ImageUtils.fileTooBigError(file.size, 500));
          return;
        }

        var opts = {
          onUploadComplete: function(body, status) {
            log('done: ', body, status);
            onComplete(null, url);
          },
          onUploadProgress: function() {
            log('progress', arguments);
            onProgress(null, 'started');
          },
          onUploadFailed: function() {
            log('failed', arguments);
            onComplete({
              code: 'UPLOAD_FAILED',
              message: 'upload failed!'
            });
          }
        };

        var reader = new FileReader();

        reader.onloadend = function() {
          var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
          uploader.beginUpload();
        };

        reader.readAsBinaryString(file);
      }
    };

    function onComponentsLoaded(componentSet) {

      $scope.componentSet = componentSet;

      function addToEditor(editor, addContent, component) {
        var max = 0;
        $('<div>' + $scope.data.item.xhtml + '</div>').find('[id]').each(function(idx, element) {
          var id = Number($(element).attr('id'));
          if (id > max) {
            max = id;
          }
        });

        var id = max + 1;

        var defaults = {
          weight: 1
        };

        var newData = _.extend(defaults, _.cloneDeep(component.defaultData));

        $scope.data.item.components[id] = newData;

        addContent($([
          '<placeholder',
          ' id="' + id + '"',
          ' component-type="' + component.componentType + '"',
          ' label="' + component.name + '"',
          '>'
        ].join('')));
      }

      function deleteComponent(id) {
        if ($scope.data.item && $scope.data.item.components) {
          delete $scope.data.item.components[id];
          ComponentRegister.deleteComponent(id);
        } else {
          throw 'Can\'t delete component with id ' + id;
        }
      }

      function componentToFeature(component) {
        return ComponentToWiggiwizFeatureAdapter.componentToWiggiwizFeature(
          component,
          addToEditor,
          deleteComponent);
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

      $scope.overrideFeatures = [
        ImageFeature
      ];

      $scope.extraFeatures = {
        definitions: [{
          name: 'external',
          type: 'dropdown',
          dropdownTitle: 'Answer Type',
          buttons: _.map(_.sortBy(componentSet, orderList), componentToFeature)
        }, {
          type: 'group',
          buttons: [
            new WiggiMathJaxFeatureDef()
          ]
        }]
      };
    }

    function onComponentsLoadError(error) {
      console.warn("Error loading components");
    }

    $scope.getUploadUrl = function(file) {
      console.log(arguments);
      return file.name;
    };

    $scope.selectFile = function(file) {
      console.log("root select file...");
      $scope.selectedFile = file;
      console.log($scope.selectedFile);
    };

    $scope.$on('fileSizeGreaterThanMax', function(event) {
      console.warn("file too big");
    });


    $scope.$on('registerConfigPanel', function(a, id, component) {
      configPanels[id] = component;
      component.setModel($scope.data.item.components[id]);
    });

    $scope.$on('save-data', function(event) {
      $scope.save();
    });

    $scope.save = function(callback) {
      log('Saving...');
      var cleaned = $scope.serialize($scope.data.item.components);
      ItemService.save({
          components: cleaned,
          xhtml: $scope.data.item.xhtml,
          summaryFeedback: $scope.isSummaryFeedbackSelected ? $scope.data.item.summaryFeedback : ""
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
        $scope.data.item.summaryFeedback = "";
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

    $scope.$watch('data.item.components', function(components) {
      $scope.componentSize = sizeToString(_.size(components));
    });

    DesignerService.loadAvailableComponents(onComponentsLoaded, onComponentsLoadError);
    WiggiWizHelper.focusCaretAtEnd('.wiggi-wiz-editable', $element);

    $scope.$on('itemLoaded', function(ev, item) {
      if (item) {
        preprocessComponents(item);
        updateSummaryFeedback(item);
      }
    });

    $scope.$emit('loadItem');
  }


})();
