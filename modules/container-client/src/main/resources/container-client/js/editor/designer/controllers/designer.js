(function() {

  angular.module('corespring-editor.controllers')
    .controller('Designer', [
      '$element',
      '$http',
      '$scope',
      '$stateParams',
      'ComponentRegister',
      'ComponentToWiggiwizFeatureAdapter',
      'DesignerService',
      'ImageFeature',
      'ImageUtils',
      'ItemService',
      'LogFactory',
      'MathJaxService',
      'WiggiFootnotesFeatureDef',
      'WiggiMathJaxFeatureDef',
      DesignerController
    ]);

  /* global AddContentModalController, com */
  function DesignerController(
    $element,
    $http,
    $scope,
    $stateParams,
    ComponentRegister,
    ComponentToWiggiwizFeatureAdapter,
    DesignerService,
    ImageFeature,
    ImageUtils,
    ItemService,
    LogFactory,
    MathJaxService,
    WiggiFootnotesFeatureDef,
    WiggiMathJaxFeatureDef) {

    var configPanels = {};

    var $log = LogFactory.getLogger('designer');

    $log.log($stateParams);

    $scope.removedComponents = {};

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
            $log.log('onUploadComplete: ', body, status);
            onComplete(null, url);
          },
          onUploadProgress: function() {
            $log.log('onUploadProgress', arguments);
            onProgress(null, 'started');
          },
          onUploadFailed: function() {
            $log.log('onUploadFailed', arguments);
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
        $scope.lastId++;

        var defaults = {
          weight: 1
        };

        var newData = _.extend(defaults, _.cloneDeep(component.defaultData));

        $scope.data.item.components[$scope.lastId] = newData;

        addContent($([
          '<placeholder',
          ' id="' + $scope.lastId + '"',
          ' component-type="' + component.componentType + '"',
          ' label="' + component.name + '"',
          '>'
        ].join('')));
      }

      function deleteComponent(id) {
        if ($scope.data.item && $scope.data.item.components) {
          ComponentRegister.deleteComponent(id);
          $scope.removedComponents[id] = _.cloneDeep($scope.data.item.components[id]);
          delete $scope.data.item.components[id];
        } else {
          throw 'Can\'t delete component with id ' + id;
        }
      }

      function reAddToEditor($node) {
        var id = $($node).attr('id');
        $scope.data.item.components[id] = $scope.removedComponents[id];
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

      var videoComponent = componentToFeature(_.find(componentSet, function(c) {
        return c.componentType === 'corespring-video';
      }));
      videoComponent.iconclass = "fa fa-film";


      $scope.overrideFeatures = [
        ImageFeature
      ];

      $scope.extraFeatures = {
        definitions: [
          {
            name: 'external',
            type: 'dropdown',
            dropdownTitle: 'Answer Type',
            buttons: _(componentSet).reject(isToolbar).sortBy(orderList).map(componentToFeature).value()
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
        ]
      };
    }

    function onComponentsLoadError(error) {
      $log.warn("Error loading components");
    }

    $scope.getUploadUrl = function(file) {
      $log.log('getUploadUrl',arguments);
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
      component.setModel($scope.data.item.components[id]);
      if (_.isFunction(component.setProfile)) {
        component.setProfile($scope.data.item.profile);
      }
    });

    $scope.$on('save-data', function(event) {
      $scope.save();
    });

    $scope.save = function(callback) {
      $log.log('Saving...');
      var cleaned = $scope.serialize($scope.data.item.components);
      for (var key in cleaned) {
        if (!ComponentRegister.hasComponent(key)) {
          delete cleaned[key];
        }
      }
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

    $scope.$on('itemLoaded', function(ev, item) {
      if (item) {
        preprocessComponents(item);
        updateSummaryFeedback(item);
        var max = 0;
        $('<div>' + $scope.data.item.xhtml + '</div>').find('[id]').each(function(idx, element) {
          var id = Number($(element).attr('id'));
          if (id > max) {
            max = id;
          }
        });
        $scope.lastId = max;


      }
    });

    $scope.$emit('loadItem');
  }


})();
