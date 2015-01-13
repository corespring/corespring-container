/* global VirtualPatch */
(function() {

  "use strict";

  function Type(fn, cleanup) {
    this.fn = fn;
    this.cleanup = cleanup;
  }

  Type.prototype.hook = function () {
    this.fn.apply(this, arguments);
    this.cleanup.call(this);
  };

  function addHook(vp, key, fn){
    vp.patch.properties = vp.patch.properties || {};
    vp.patch.properties[key] = new Type( fn, createCleanup(vp.patch.properties, key));
  }

  function createCleanup(vpatchProperties, key){
    return function() {
      if (vpatchProperties && key) {
        delete vpatchProperties[key];
      }
    };
  }

  function DomUtil(){

    this.stringToElement = function(s){
      var parser = new DOMParser();
      var doc = parser.parseFromString('<div class="preview-player-tmp-wrapper">' + s + '</div>', 'text/html');
      var errors = doc.querySelectorAll('parsererror');

      if(errors.length === 0){
        var div = doc.querySelector('.preview-player-tmp-wrapper');
        return div;
      }
    };
  }

  /**
   * A preview that is optimized to make a minimum of calls to $compile. 
   */
  angular.module('corespring-editor.directives').directive('optimizedPreviewPlayer', [
    '$compile',
    'LogFactory',
    'ComponentData',
    'MathJaxService',
    'MathFormatUtils',
    function($compile, LogFactory, ComponentData, MathJaxService, MathFormatUtils) {
      var logger = LogFactory.getLogger('corespring-preview-player');

      function link($scope, $element, $attrs, ngModel){
        var firstRun = true;
        var rootVDom, rootNode;
        var domUtil = new DomUtil();
        var componentScopes = {};
        var rendered = {};
        var h = virtualDom.h; //jshint ignore:line
        var diff = virtualDom.diff; //jshint ignore:line
        var patch = virtualDom.patch; //jshint ignore:line
        var createElement = virtualDom.create; //jshint ignore:line
        var virtualize = vdomVirtualize; //jshint ignore:line

        function containsCorespring(s){
          return _.contains(s.toLowerCase(), 'corespring');
        }

        function addCompilationPending(el, prop){
          el.setAttribute('compilation-pending', true);
        }

        function processPatch(vp){
          var isNodeMoveOrInsert = vp && _.contains([VirtualPatch.INSERT, VirtualPatch.VNODE], vp.type);
          var isCorespringTag = vp.patch && vp.patch.tagName && containsCorespring(vp.patch.tagName);

          if(isCorespringTag && isNodeMoveOrInsert){
            var key = vp.patch.tagName;
            logger.debug('found a patch that needs compile: ', key);
            addHook(vp, key, addCompilationPending);
          }

          if(vp.vNode && vp.vNode.tagName && containsCorespring(vp.vNode.tagName)){
            var id = vp.vNode.properties.id;
            if(componentScopes[id]){
              logger.debug('destroy scope: ', id);
              componentScopes[id].$destroy();
            }
          }
        }

        function addHooks(patches){
          for(var k in patches){
            if(k !== 'a'){
              var p = patches[k];

              if(_.isArray(p)){
                _.forEach(p, processPatch);
              } else {
                processPatch(p);
              }
            }
          }
        }

        /**
         * Math rendering requires that we virtualize the entire node containing math (MathML or LaTex).
         * We create a vdom Widget which allows us to control how the target dom gets updated.
         */

        var customVirtualizers = [
          {
            canVirtualize: function(el){
              return el.hasAttribute('mathjax');
            },
            virtualize: function(el){
              var text = el.innerHTML;
              return new MathWidget(el.innerHTML);
            }
          }
        ];

        /** Vdom MathWidget definition */ 
        function MathWidget(math){
          this.name = 'MathWidget';
          this.type = 'Widget';
          this.version = '1';
          this.math = math;

          this.init = function(){
            var out = document.createElement('span');
            out.textContent = this.math;
            return out; 
          };

          this.update = function(old, domNode){
            var info = MathFormatUtils.getMathInfo(this.math);

            while (domNode.firstChild) {
              domNode.removeChild(domNode.firstChild);
            }

            if(info.mathType === 'MathML'){
              
              var range = document.createRange();
              var documentFragment = range.createContextualFragment(this.math);
              domNode.appendChild(documentFragment);
            } else {
              domNode.textContent = this.math;
            }
          };
          
          this.destroy = function(){
            this.math = null;
          };
        }
 

        /**
         * Update the dom using the latest $viewValue
         * Note - if we moved to 1.3.x we can use: ng-model-options="{debounce: 300}"
         */
        ngModel.$render = _.debounce(function() {

          if (!ngModel.$viewValue) {
            return;
          }

          console.log("Rendering: ", ngModel.$viewValue);

          if (firstRun) {
            var el = domUtil.stringToElement(ngModel.$viewValue);
            rootVDom = virtualize(el, customVirtualizers);
            rootNode = createElement(rootVDom);
            $element[0].appendChild(rootNode); //.cloneNode(true));
            $compile($element)($scope.$new());
          }

          firstRun = false;

          var newEl = domUtil.stringToElement(ngModel.$viewValue);
          console.log("new: ");
          console.log(newEl);

          if (newEl) {
            var newVDom = virtualize(newEl, customVirtualizers);
            var patches = diff(rootVDom, newVDom);
            addHooks(patches);
            rootNode = patch(rootNode, patches);
            rootVDom = newVDom;
          }

          var compileNodes = $element.find('[compilation-pending=true]');

          compileNodes.each(function(index, node){
            node.removeAttribute('compilation-pending');
            var id = node.getAttribute('id');
            if(componentScopes[id]){
              componentScopes[id].$destroy();
            }
            componentScopes[id] = $scope.$new();
            $compile(node)(componentScopes[id]);
          });
          
          /** because we are outside of angular - we need to trigger a $digest() */
          if(compileNodes.length > 0){
            $scope.$digest();
          }          

          //TODO: We can apply the same selective rendering here as we do with $compile
          triggerMathRendering();
        }, 200, {leading: false, trailing: true});
        

        function triggerMathRendering(){
          MathJaxService.onEndProcess(function(){
            $('.player-body').removeClass('hidden-player-body');
            MathJaxService.off(arguments.callee); //jshint ignore:line
          });

          MathJaxService.parseDomForMath(0, $element.find('.corespring-player')[0]);
        }


        function updateRenderedComponents(){
          logger.debug('[updateRenderedComponents]');

          if(!ngModel.$viewValue){
            return;
          }

          if(!$scope.components){
            return;
          }

          if(_.isEqual($scope.components, rendered.components)){
            logger.debug('[updateRenderedComponents] components are the same - skip update');
            return;
          }

          _.forIn($scope.components, function(model, id){
            if(_.isEqual(model, rendered.components ? rendered.components[id] : null)){
              logger.debug('[updateRenderedComponents] id', id, 'data is same skip...');
            } else {
              logger.debug('[updateRenderedComponents] id', id, 'updating...');
              ComponentData.updateComponent(id, model);
            }
          });

          rendered.components = _.cloneDeep($scope.components);
        }

        var debouncedUpdateComponents = debounce(updateRenderedComponents);

        function debounce(fn){
          return _.debounce(function(){
            fn();
            $scope.$digest();
          }, 200, {leading: false, trailing: true});
        }

        $scope.$watch('components', function(c, prev){
          if (!c || !prev) {
            return;
          }

          debouncedUpdateComponents();
        }, true);

        $scope.$watch('outcomes', function(r, prev) {
          if (!r || !prev) {
            return;
          }
          ComponentData.setOutcomes(r);
          MathJaxService.parseDomForMath();
        }, true);

        debouncedUpdateComponents();
      }

      return {
        restrict: 'E',
        link: link,
        require: '?ngModel',
        scope : {
          components: '=playerComponents',
          outcomes: '=playerOutcomes',
          session: '=playerSession'
        },
        template : [
          '<div class="corespring-player">',
          '  <div class="player-body hidden-player-body"></div>',
          '</div>'
        ].join('\n'),
        replace: true
      };
    }
  ]);
})();
