angular.module('corespring-editor.services').service('EditorConfig', [
    'ItemService',
    'LogFactory',
    'DesignerService',
    'ImageFeature',
    'WiggiFootnotesFeatureDef',
    'WiggiMathJaxFeatureDef',
    'WiggiLinkFeatureDef',
    'ComponentToWiggiwizFeatureAdapter',
    'ComponentData',
    function(
      ItemService,
      LogFactory,
      DesignerService,
      ImageFeature,
      WiggiFootnotesFeatureDef,
      WiggiMathJaxFeatureDef,
      WiggiLinkFeatureDef,
      ComponentToWiggiwizFeatureAdapter,
      ComponentData) {


      function EditorConfig(){

        var 
          configPanels = {},
          interactions = null, 
          widgets = null,
          logger = LogFactory.getLogger('editor-config');


        function onComponentsLoaded(uiComponents) {
          interactions = uiComponents.interactions;
          widgets = uiComponents.widgets;
          initComponents.bind(this)();
        }

        function initComponents() {

          if (!interactions || !widgets) {
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

          var videoComponent = componentToFeature(_.find(widgets,
            function(c) {
              return c.componentType === 'corespring-video';
            }));

          videoComponent.iconclass = "fa fa-film";

          this.overrideFeatures = [
            ImageFeature
          ];

          var linkFeatureGroup = {
            type: 'group',
            buttons: [
              new WiggiLinkFeatureDef()
            ]
          };

          var linkFeature = {
            definitions: [linkFeatureGroup]
          };

          this.extraFeatures = {
            definitions: [{
              name: 'external',
              type: 'dropdown',
              dropdownTitle: 'Answer Type',
              buttons: _(interactions)
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

        this.onFileSizeGreaterThanMax = function($event){
          logger.warn('file too big');
        };

        function onComponentsLoadError(error) {
          throw new Error("Error loading components");
        }

        DesignerService
          .loadAvailableUiComponents(
            onComponentsLoaded.bind(this),
            onComponentsLoadError);
      }


      return new EditorConfig();

    }
  ]);