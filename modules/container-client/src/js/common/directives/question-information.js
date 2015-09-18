angular.module('corespring-common.directives')
  .directive('questionInformation', [
    '$log',
    '$sce',
    'MathJaxService',
    'SmUtils',
    function(
      $log,
      $sce,
      MathJaxService,
      SmUtils
    ) {
      return {
        restrict: 'EA',
        scope: {
          item: "=ngModel",
          tabs: "="
        },
        templateUrl: "/common/directives/question-information.html",
        link: link
      };

      function link(scope, $element) {

        scope.playerMode = 'gather';

        var defaultTabs = ['question', 'profile', 'supportingMaterial'];

        scope.activeTab = 'teacher';
        scope.selectedMaterial = undefined;

        function availableTabs(){
          return _(scope.tabs).keys().filter(function(k){
            return scope.tabs[k];
          }).value();
        }

        function availableTabCount(){
          return availableTabs().length;
        }

        function shouldHideNav(){
          var count = availableTabCount();
          
          if(count > 1){
            return false;
          }

          if(count === 1 && availableTabs()[0] === 'supportingMaterial'){
            return false;
          }

          return true;
        }

        function setActiveTab(tab) {
          if(scope.tabs && scope.tabs[tab]){
            return tab;
          }

          if ((tab === 'teacher' || tab === 'student') && scope.tabs && scope.tabs['question']) {
            return tab;
          }

          return _.find(_.pull(defaultTabs, tab), function(t) {
            return scope.tabs[t];
          });
        }

        function selectFirstSupportingMaterial(){
          if(scope.item && 
            scope.item.supportingMaterials && 
            scope.item.supportingMaterials.length > 0){
            scope.selectSupportingMaterial(scope.item.supportingMaterials[0]);
          }
        }

        function updateNav(){
          if(!scope.tabs){
            return;
          }

          scope.activeTab = setActiveTab(scope.activeTab);
          scope.hideNav = shouldHideNav();
          
          if(scope.activeTab === 'supportingMaterial'){
            selectFirstSupportingMaterial();
          }
        }

        scope.$watch('item', function onChangeItem(item) {
          if (item) {
            scope.sections = SmUtils.group(item.supportingMaterials, 'materialType');
            updateNav();
          }
        });

        scope.$watch('tabs', function onChangeTabs(tabs) {
          updateNav();
        }, true);

        scope.selectTab = function(tab) {
          scope.activeTab = tab;
          scope.selectedMaterial = undefined;
        };

        scope.selectSupportingMaterial = function(material) {
          scope.activeTab = 'supportingMaterial';
          scope.selectedMaterial = material;
          scope.mainFile = prepareMainFile(material);
          scope.binaryUrl = SmUtils.getBinaryUrl(material, scope.mainFile);
          MathJaxService.parseDomForMath(100, $element[0]);
        };
        
        function addPathToImageUrls(html, process) {
          var $html = $('<span>' + html + '</span>');
          var $images = $html.find('img');
          if($images.length > 0) {
            $images.each(function (index, img) {
              var src = $(img).attr('src').split('/').pop();
              $(img).attr('src', process(src));
            });
            return $html.html();
          } else {
            return html;
          }
        }

        function prepareMainFile(m){
          var main = SmUtils.mainFile(m);

          if(main && main.contentType === 'text/html'){
            var clone = _.clone(main);
            clone.content = addPathToImageUrls(main.content, function(asset){
              return SmUtils.getBinaryUrl(m, {name: asset});
            });
            return clone;
          } else {
            return main;
          }
        }
       
      }
  }
]);