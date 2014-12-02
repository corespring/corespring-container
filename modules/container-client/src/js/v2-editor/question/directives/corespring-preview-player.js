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
    var parser = new DOMParser();

    this.stringToElement = function(s){
      var doc = parser.parseFromString(s, 'application/xml');
      var errors = doc.querySelectorAll('parsererror');

      if(errors.length === 0){
        return doc.children[0];
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
        var rootDom, rootNode;
        var domUtil = new DomUtil();

        var h = virtualDom.h; //jshint ignore:line
        var diff = virtualDom.diff; //jshint ignore:line
        var patch = virtualDom.patch; //jshint ignore:line
        var createElement = virtualDom.create; //jshint ignore:line
        var virtualize = vdomVirtualize; //jshint ignore:line


        function compileHook(el, prop){
          $compile(el)($scope.$new());
        }

        function addHooks(patches){

          var out = {};
          for(var k in patches){
            if(k !== 'a'){
              var p = patches[k];

              if(p.type === VirtualPatch.INSERT && p.patch.tagName.indexOf('coresspring') !== -1 ){
                console.log('found a patch that needs compile: ', p);

                var key = p.patch.tagName;
                p.patch.properties = p.patch.properties || {};
                p.patch.properties[key] = hook( compileHook ) ;
                out[k] = p;
              }
            }
          }
          return out;
        }

        /**
         * Update the dom using the latest $viewValue
         */
        ngModel.$render = function() {

          if (!ngModel.$viewValue) {
            return;
          }

          if (firstRun) {
            var el = domUtil.stringToElement(ngModel.$viewValue);
            rootDom = virtualize(el);
            rootNode = createElement(rootDom);
            $element[0].appendChild(rootNode);
            $compile($element)($scope.$new());
          }

          firstRun = false;

          var newEl = domUtil.stringToElement(ngModel.$viewValue);

          if (newEl) {
            var newDom = virtualize(newEl);
            var patches = diff(rootDom, newDom);
            var cPatches = addHooks(patches);
            rootNode = patch(rootNode, patches);
            rootDom = newDom;
          }
        };

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
