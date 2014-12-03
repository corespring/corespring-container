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

  angular.module('corespring-editor.directives').directive('corespringPreviewPlayer', [
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

        function addHookToPatch(vp){
          var isSupportedType = vp && _.contains([VirtualPatch.INSERT, VirtualPatch.VNODE], vp.type);
          var isCorespringTag = vp.patch && vp.patch.tagName && _.contains(vp.patch.tagName.toLowerCase(), 'corespring');

          if(isSupportedType && isCorespringTag ){
            var key = vp.patch.tagName;
            logger.debug('found a patch that needs compile: ', key);
            vp.patch.properties = vp.patch.properties || {};
            vp.patch.properties[key] = hook( addCompilationPending ) ;
          }
        }

        function addHooks(patches){
          for(var k in patches){
            logger.debug('patches', k, patches[k]);
            if(k !== 'a'){
              var p = patches[k];

              if(_.isArray(p)){
                _.forEach(p, addHookToPatch);
              } else {
                addHookToPatch(p);
              }
            }
          }
        }

        /**
         * Update the dom using the latest $viewValue
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

          logger.debug('new html:', ngModel.$viewValue);
          var newEl = domUtil.stringToElement(ngModel.$viewValue);
          logger.debug('new el:', newEl.innerHTML);
          logger.debug('existing el:', rootNode.innerHTML);

          if (newEl) {
            var newVDom = virtualize(newEl);
            var patches = diff(rootVDom, newVDom);
            var cPatches = addHooks(patches);
            rootNode = patch(rootNode, patches);
            rootVDom = newVDom;
          }

          var compileNodes = $element.find('[compilation-pending=true]');

          compileNodes.each(function(index, node){
            logger.debug('compiling -> ', node);
            node.removeAttribute('compilation-pending');
            var id = node.getAttribute('id');
            if(scopes[id]){
              scopes[id].$destroy();
            }
            scopes[id] = $scope.$new();
            $compile(node)(scopes[id]); 
          });
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


        function updateUi(){

          logger.debug('[updateUi]');

          if(!$scope.xhtml){
            return;
          }

          if(!$scope.components){
            return;
          }

          var isEqual = _.isEqual($scope.xhtml, rendered.xhtml);

          if (!isEqual) {
            logger.debug('[updateUi] xhtml', $scope.xhtml);
            renderMarkup($scope.xhtml);
            rendered.xhtml = _.cloneDeep($scope.xhtml);
          }

          if(_.isEqual($scope.components, rendered.components)){
            logger.debug('[updateUi] components are the same - skip update');
            return;
          }

          _.forIn($scope.components, function(model, id){
            if(_.isEqual(model, rendered.components ? rendered.components[id] : null)){
              logger.debug('[updateUi] id', id, 'data is same skip...');
            } else {
              logger.debug('[updateUi] id', id, 'updating...');
              ComponentData.updateComponent(id, model);
            }
          });

          rendered.components = _.cloneDeep($scope.components);
        }

        var debouncedUpdateUi = debounce(updateUi);

        function debounce(fn){
          return _.debounce(fn, 300, {leading: false, trailing: true});
        }

        /*$scope.$watch('xhtml', function() {
          debouncedUpdateUi();
        });*/

        $scope.$watch('components', function(){
          debouncedUpdateUi();
        }, true);

        $scope.$watch('outcomes', function(r) {
          if (!r) {
            return;
          }
          ComponentData.setOutcomes(r);
          MathJaxService.parseDomForMath();
        }, true);

        debouncedUpdateUi();
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
