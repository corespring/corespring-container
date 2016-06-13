angular.module('corespring-editor.services').service('EditorConfig', [
    'ComponentData',
    'ComponentDefaultData',
    'ComponentToWiggiwizFeatureAdapter',
    'DesignerService',
    'ImageFeature',
    'ItemService',
    'LogFactory',
    'WiggiFootnotesFeatureDef',
    'WiggiLinkFeatureDef',
    'WiggiMathJaxFeatureDef',
    function(
      ComponentData,
      ComponentDefaultData,
      ComponentToWiggiwizFeatureAdapter,
      DesignerService,
      ImageFeature,
      ItemService,
      LogFactory,
      WiggiFootnotesFeatureDef,
      WiggiLinkFeatureDef,
      WiggiMathJaxFeatureDef
    ) {

      function EditorConfig(){

        var configPanels = {},
          interactions = null,
          widgets = null,
          logger = LogFactory.getLogger('editor-config');

        this.onFileSizeGreaterThanMax = function($event){
          logger.warn('file too big');
        };

        DesignerService
            .loadAvailableUiComponents(
            onComponentsLoaded.bind(this),
            onComponentsLoadError);

        //--------------------------------------------------------------

        function onComponentsLoaded(uiComponents) {
          interactions = uiComponents.interactions;
          widgets = uiComponents.widgets;
          initComponents.bind(this)();
        }

        function onComponentsLoadError(error) {
          throw new Error("Error loading components");
        }

        function initComponents() {
          if (!interactions || !widgets) {
            return;
          }

          _.forEach(interactions, storeDefaultData);
          _.forEach(widgets, storeDefaultData);

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

          var audioPlayerComponent = componentToFeature(_.find(widgets,
            function(c) {
              return c.componentType === 'corespring-audio-player';
            }));

          audioPlayerComponent.iconclass = "fa fa-file-sound-o";

          var videoComponent = componentToFeature(_.find(widgets,
              function(c) {
                return c.componentType === 'corespring-video';
              }));

          videoComponent.iconclass = "fa fa-film";

          var calculatorFeature = widgetToFeature('corespring-calculator');
          var rulerFeature = widgetToFeature('corespring-ruler');
          var protractorFeature = widgetToFeature('corespring-protractor');
          
          this.overrideFeatures = [
            ImageFeature
          ];

          var linkFeatureGroup = mkGroup(new WiggiLinkFeatureDef());

          this.mathJaxFeatureGroup =  function(){
            return mkGroup(new WiggiMathJaxFeatureDef());
          };

          this.footnotesFeatureGroup = function(){
            return mkGroup(new WiggiFootnotesFeatureDef());
          };

          this.extraFeatures = {
            definitions: [{
              name: 'external',
              type: 'dropdown',
              class: 'external',
              dropdownTitle: 'Insert Interaction',
              buttons: _(interactions)
                  .reject(isToolbar)
                  .filter(isReleased)
                  .sortBy(orderList)
                  .map(componentToFeature)
                  .value()
            },
            {
              name: 'tools',
              type: 'dropdown',
              class: 'tools',
              dropdownTitle: 'Tools',
              buttons: _([
                  calculatorFeature,
                  rulerFeature,
                  protractorFeature
                ])
                .sortBy(orderList)
                .value()
            },
            this.mathJaxFeatureGroup(),
            this.footnotesFeatureGroup(),
            {
              type: 'group',
              buttons: [
                videoComponent,
                audioPlayerComponent
              ]
            }]
          };

          //------------------------------------

          function storeDefaultData(comp){
            ComponentDefaultData.setDefaultData(comp.componentType, comp.defaultData);
          }

          function addToEditor(editor, addContent, component) {
            var newComponentId = ComponentData.addComponentModel(component.defaultData);

            addContent($([
              '<placeholder',
              ' id="' + newComponentId + '"',
              ' component-type="' + component.componentType + '"',
              ' label="' + component.name + '"',
              '>'
            ].join('')));
          }

          function componentToFeature(component) {
            return ComponentToWiggiwizFeatureAdapter.componentToWiggiwizFeature(
                component,
                addToEditor,
                deleteComponent,
                reAddToEditor
            );
          }

          function widgetToFeature(t) {
            var target = _.find(widgets, function(w) {
              return w.componentType === t;
            });
            return componentToFeature(target);
          }

          function deleteComponent(id) {
            ComponentData.deleteComponent(id);
          }

          function reAddToEditor($node) {
            var id = $($node).attr('id');
            ComponentData.restoreComponent(id);
          }

          function orderList(component) {
            var idx = _.indexOf(orderedComponents, component.componentType);
            return idx >= 0 ? idx : 1000;
          }

          function isToolbar(component) {
            return component.titleGroup === 'toolbar';
          }

          function isReleased(component) {
            return component.released;
          }

          function mkGroup(){
            return {
              type: 'group',
              buttons: Array.prototype.slice.call(arguments)
            };
          }
        }
      }

      return new EditorConfig();

    }
  ]);
