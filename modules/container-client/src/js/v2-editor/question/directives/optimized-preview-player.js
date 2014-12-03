/* global VirtualPatch */
(function() {

  function Type(fn) {
   this.fn = fn;
  }

  Type.prototype.hook = function () {
    this.fn.apply(this, arguments);
  };

  function hook(fn) {
    return new Type(fn);
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
    function($compile, LogFactory, ComponentData, MathJaxService) {
      var logger = LogFactory.getLogger('corespring-preview-player');

      function link($scope, $element, $attrs, ngModel){

        var firstRun = true;
        var rootVDom, rootNode;
        var domUtil = new DomUtil();

        var h = virtualDom.h; //jshint ignore:line
        var diff = virtualDom.diff; //jshint ignore:line
        var patch = virtualDom.patch; //jshint ignore:line
        var createElement = virtualDom.create; //jshint ignore:line
        var virtualize = vdomVirtualize; //jshint ignore:line


        function addCompilationPending(el, prop){
          el.setAttribute('compilation-pending', true);
        }

        function containsCorespring(s){ 
          return _.contains(s.toLowerCase(), 'corespring');
        }

        function processPatch(vp){
          var isNodeMoveOrInsert = vp && _.contains([VirtualPatch.INSERT, VirtualPatch.VNODE], vp.type);
          var isCorespringTag = vp.patch && vp.patch.tagName && containsCorespring(vp.patch.tagName);

          if(isCorespringTag && isNodeMoveOrInsert){
            var key = vp.patch.tagName;
            logger.debug('found a patch that needs compile: ', key);
            vp.patch.properties = vp.patch.properties || {};
            vp.patch.properties[key] = hook( addCompilationPending ) ;
          }

          if(vp.vNode && vp.vNode.tagName && containsCorespring(vp.vNode.tagName)){
            var id = vp.vNode.properties.id;
            if(scopes[id]){
              logger.debug('destroy scope: ', id);
              scopes[id].$destroy();
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
         * Update the dom using the latest $viewValue
         * Note - if we moved to 1.3.x we can use: ng-model-options="{debounce: 300}"
         */
        ngModel.$render = _.debounce(function() {

          if (!ngModel.$viewValue) {
            return;
          }

          if (firstRun) {
            var el = domUtil.stringToElement(ngModel.$viewValue);
            rootVDom = virtualize(el);
            rootNode = createElement(rootVDom);
            $element[0].appendChild(rootNode); //.cloneNode(true));
            $compile($element)($scope.$new());
          }

          firstRun = false;

          var newEl = domUtil.stringToElement(ngModel.$viewValue);

          if (newEl) {
            var newVDom = virtualize(newEl);
            var patches = diff(rootVDom, newVDom);
            var cPatches = addHooks(patches);
            rootNode = patch(rootNode, patches);
            rootVDom = newVDom;
          }

          var compileNodes = $element.find('[compilation-pending=true]');

          compileNodes.each(function(index, node){
            node.removeAttribute('compilation-pending');
            var id = node.getAttribute('id');
            if(scopes[id]){
              scopes[id].$destroy();
            }
            scopes[id] = $scope.$new();
            $compile(node)(scopes[id]); 
          });
          
          /** because we are outside of angular - we need to trigger a $digest() */
          if(compileNodes.length > 0){
            $scope.$digest();
          }          
        }, 200, {leading: false, trailing: true});
        
        var scopes = {};

        var rendered = {};

        var renderMarkup = function(xhtml) {
          logger.debug('[renderMarkup]...');

          $element.find('.player-body').addClass('hidden-player-body');

          if ($scope.lastScope) {
            $scope.lastScope.$destroy();
          }

          $scope.lastScope = $scope.$new();

          var $body = $element.find('.player-body').html(xhtml);

          $compile($body)($scope.lastScope);

          MathJaxService.onEndProcess(function(){
            $('.player-body').removeClass('hidden-player-body');
            MathJaxService.off(arguments.callee);
          });

          MathJaxService.parseDomForMath(0, $element.find('.player-body')[0]);
        };


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
          }, 300, {leading: false, trailing: true});
        }

        $scope.$watch('components', function(){
          debouncedUpdateComponents();
        }, true);

        $scope.$watch('outcomes', function(r) {
          if (!r) {
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
