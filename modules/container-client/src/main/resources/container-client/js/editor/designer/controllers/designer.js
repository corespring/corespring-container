/* global AddContentModalController */
var controller = function($scope, $compile, $http, $timeout, $modal, $log, DesignerService, PlayerService, MathJaxService, ComponentRegister) {

  $scope.showComponentsPanel = false;

  // TODO: find last id from markup
  $scope.lastId = 10;

  $scope.extraFeatures = [

    {
      name: 'external',
      type: 'dropdown',
      dropdownTitle: 'Components',
      buttons: [

        {
          name: 'corespring-multiple-choice',
          toolbar: '<button class="btn btn-default btn-sm btn-small">CB</button>',
          clickable: true, //? Is this the best way to set up clickability?
          compile: true,
          initialise: function($node, replaceWith) {
            var id = $node.attr('id');
            return replaceWith('<placeholder label="multiple-choice:' + id + '" id="' + id + '"></placeholder>');
          },
          addToEditor: function(editor, addContent) {
            var id = ++$scope.lastId;
            $scope.item.components[id] = {
              "componentType": "corespring-multiple-choice",
              "title": "Fruits",
              "weight": 10,
              "correctResponse": {
                "value": ["carrot", "turnip", "potato"]
              },
              "feedback": [{
                "value": "banana",
                "feedback": "Incorrect"
              }, {
                "value": "carrot",
                "feedback": "Correct",
                "notChosenFeedback": "This is a vegetable"
              }, {
                "value": "apple",
                "feedback": "it's a fruit"
              }, {
                "value": "turnip",
                "feedback": "Correct",
                "notChosenFeedback": "This is a vegetable"
              }, {
                "value": "potato",
                "feedback": "Correct",
                "notChosenFeedback": "This is a vegetable"
              }, {
                "value": "wheat",
                "feedback": "Incorrect"
              }],
              "model": {
                "prompt": "Which of these is a vegetable?",
                "config": {
                  "orientation": "vertical",
                  "shuffle": true
                },
                "choices": [{
                  "label": "Banana",
                  "value": "banana"
                }, {
                  "label": "Carrot",
                  "value": "carrot"
                }, {
                  "label": "Apple",
                  "value": "apple"
                }, {
                  "label": "Turnip",
                  "value": "turnip"
                }, {
                  "label": "Potato",
                  "value": "potato"
                }, {
                  "label": "Wheat",
                  "value": "wheat"
                }]
              }
            };
            addContent($('<placeholder id="' + id + '" label="Multi Choice">'));
          },
          onDblClick: function($node, $scope, editor) {
            var data = {};
            var content = '<corespring-multiple-choice-config id="' + $node.attr('id') + '"></corespring-multiple-choice-config>';
            editor.showEditPane(data, 'Edit multiple-choice (' + $node.attr('id') + ')', content, function() {
              $log.debug('on update...');
            }, {});
          },
          getMarkUp: function($node, $scope) {
            var id;
            if ($scope && $scope.$$childHead) {
              id = $scope.$$childHead.id;
            } else {
              id = $node.attr('id');
            }
            return '<corespring-multiple-choice id = "' + id + '"></corespring-multiple-choice>';
          }
        }
      ]
    }
  ];

  var configPanels = {};

  var getUid = function() {
    return Math.random().toString(36).substring(2, 9);
  };

  $scope.editorMode = "visual";

  $scope.openChooser = function() {

    var modalInstance = $modal.open({
      templateUrl: 'add-component.html',
      controller: AddContentModalController,
      backdrop: true,
      scope: $scope,
      resolve: {
        componentSet: function() {
          return $scope.componentSet;
        }
      }
    });

    modalInstance.result.then(
      function(componentMap) {
        _.each(componentMap, function(v, k) {
          _(v.amount).times(function() {
            $scope.addComponent(v.component);
          });
        });

      },
      function() {
        $log.info('Modal dismissed at: ' + new Date());
      });
  };


  $scope.onComponentsLoaded = function(componentSet) {
    $scope.componentSet = componentSet;
  };

  $scope.getIconUrl = function(type) {
    var comp = _.find($scope.componentSet, function(c) {
      return c.componentType === type;
    });

    if (comp) {
      return comp.icon;
    }
  };

  $scope.hasComponents = function() {
    return $scope.item && _.size($scope.item.components) > 0;
  };

  $scope.isNewItem = function() {
    return $scope.item && !$scope.hasComponents();
  };

  $scope.onComponentsLoadError = function(error) {
    console.warn("Error loading components");
  };


  $scope.getUploadUrl = function(file) {
    console.log(arguments);
    return file.name;
  };

  $scope.selectFile = function(file) {
    console.log("root select file...");
    $scope.selectedFile = file;
    $scope.selectedComponent = null;
    console.log($scope.selectedFile);
  };

  $scope.addComponent = function(descriptor) {
    console.log("add component" + descriptor.componentType);
    var uid = getUid();
    $scope.item.components[uid] = _.cloneDeep(descriptor.defaultData);
    var node = $($scope.item.xhtml);
    node.append("<" + descriptor.componentType + " id='" + uid + "'></" + descriptor.componentType + ">");
    $scope.item.xhtml = "<div>" + node.html() + "</div>";

    if (!$scope.selectedComponent) {
      $scope.selectedComponent = {
        id: uid,
        component: $scope.item.components[uid]
      };
    }
  };

  $scope.$on('fileSizeGreaterThanMax', function(event) {
    console.warn("file too big");
  });

  $scope.getQuestionForComponentId = function(id) {
    return $scope.item.components[id];
  };

  $scope.$on('registerConfigPanel', function(a, id, component) {
    console.log("registerConfigPanel:", id, component);
    configPanels[id] = component;
    component.setModel($scope.item.components[id]);
  });

  $scope.save = function() {
    console.log("Saving: ");
    console.log($scope.item.components);
    var cleaned = $scope.serialize($scope.item.components);
    console.log(cleaned);
    DesignerService.save($scope.itemId, cleaned, $scope.onItemSaved, $scope.onItemSaveError, $scope.itemId);
  };

  $scope.serialize = function(comps) {

    if (!configPanels) {
      return comps;
    }

    var newModel = _.cloneDeep(comps);
    _.each(comps, function(value, key) {
      var component = configPanels[key];
      if (component && component.getModel) {
        comps[key] = component.getModel();
      }
    });
    return comps;
  };


  $scope.$on('mathJaxUpdateRequest', function() {
    MathJaxService.parseDomForMath();
  });

  $scope.switchToJsonView = function() {
    $scope.selectedComponentJson = JSON.stringify($scope.selectedComponent.component, null, 2);
    $scope.editorMode = 'json';
  };

  $scope.$watch('selectedComponent.id', function(newValue) {
    if (newValue) {
      $scope.selectedComponentJson = JSON.stringify($scope.selectedComponent.component, null, 2);
    }
  });

  $scope.jsonEditorLoaded = function(_editor) {
    var _session = _editor.getSession();
    _session.setUseWrapMode(true);
    _session.setWrapLimitRange(70, 80);
  };


  $scope.jsonEditorChanged = function(val) {
    var newObject = JSON.parse($scope.selectedComponentJson);
    for (var key in $scope.selectedComponent.component) {
      $scope.selectedComponent.component[key] = newObject[key];
    }
  };


  $scope.getItem = function() {
    return $scope.item;
  };

  $scope.selectFirstComponent = function() {
    for (var c in $scope.item.components) {
      $scope.selectedComponent = {
        id: c,
        component: $scope.item.components[c]
      };
      break;
    }
  };

  PlayerService.setQuestionLookup($scope.getQuestionForComponentId);
  PlayerService.setItemLookup($scope.getItem);

  function initDesigner(item) {

    _.each(item.components, function(c, key) {
      var serverLogic = corespring.server.logic(c.componentType);
      if (serverLogic.preprocess) {
        //TODO: This is part of a larger task to add preprocess to the container
        //@see: https://thesib.atlassian.net/browse/CA-842
        item.components[key] = serverLogic.preprocess(c);
      }
    });

    $scope.item = item;

    $scope.selectFirstComponent();

    var scoringJs = _.find($scope.item.files, function(f) {
      return f.name === "scoring.js";
    });

    if (scoringJs) {
      PlayerService.setScoringJs(scoringJs);
    }
  }

  //  DesignerService.loadItem($scope.itemId, function(item){
  //    initDesigner(item);
  //  });

  DesignerService.loadAvailableComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);
};

angular.module('corespring-editor.controllers')
  .controller('Designer', ['$scope',
    '$compile',
    '$http',
    '$timeout',
    '$modal',
    '$log',
    'DesignerService',
    'PlayerService',
    'MathJaxService',
    'ComponentRegister',
    controller
  ]);