angular.module('corespring-common.directives')
  .directive('questionInformation', [
    '$log',
    '$sce',
    'ComponentService',
    'DataQueryService',
    'MathJaxService',
    'ProfileFormatter',
    'SmUtils',
    'SupportingMaterialsService',
    function(
      $log,
      $sce,
      ComponentService,
      DataQueryService,
      MathJaxService,
      ProfileFormatter,
      SmUtils,
      SupportingMaterialsService
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

        scope.availableTabs = {
          question: true,
          profile: true,
          supportingMaterial: true
        };
        scope.activeTab = 'question';
        scope.selectedMaterial = undefined;

        scope.$watch('item', function onChangeItem(item) {
          if (item) {

            scope.sections = SmUtils.group(item.supportingMaterials, 'materialType');
            //getSupportingMaterials(item);
            //if (isShowingSupportingMaterials()) {
              //scope.selectSupportingMaterial(0);
            //}
            //showNavIfMoreThanOneSupportingMaterialsAvailable();
          }
        });

        scope.$watch('tabs', function onChangeTabs(tabs) {
          if (tabs) {
            assignAvailableTabs(tabs);
            hideNav(numberOfAvailableTabs(tabs) === 1);
            showNavIfMoreThanOneSupportingMaterialsAvailable();
            activateFirstAvailableTabIfCurrentTabDoesNotExist();
          }
        });

        scope.selectTab = function(tab) {
          scope.activeTab = tab;
          scope.selectedMaterial = undefined;
        };

        scope.selectSupportingMaterial = function(material) {
          scope.activeTab = 'supportingMaterial';
          scope.selectedMaterial = material;
          scope.mainFile = prepareMainFile(material);
          scope.binaryUrl = SupportingMaterialsService.getBinaryUrl(material, scope.mainFile);
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
            var path = SupportingMaterialsService.getBinaryUrl(m, {name: ':filename'});
            clone.content = addPathToImageUrls(main.content, function(asset){
              return SupportingMaterialsService.getBinaryUrl(m, {name: asset});
            });
            return clone;
          } else {
            return main;
          }
        }

        function hideNav(hide) {
          scope.hideNav = hide;
        }

        /*function getSupportingMaterials(item) {
          scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups(item.supportingMaterials);
        }*/

        function isShowingSupportingMaterials() {
          return scope.activeTab === 'supportingMaterial';
        }

        function showNavIfMoreThanOneSupportingMaterialsAvailable() {
          if (scope.availableTabs && scope.availableTabs.supportingMaterial && scope.item.supportingMaterials && scope.item.supportingMaterials.length > 1) {
            hideNav(false);
          }
        }

        function assignAvailableTabs(tabs) {
          scope.availableTabs = tabs;
        }

        function numberOfAvailableTabs(tabs) {
          var tabCount = 0;
          for (var tabKey in tabs) {
            if (tabs[tabKey]) {
              tabCount++;
            }
          }
          return tabCount;
        }

        function activateFirstAvailableTabIfCurrentTabDoesNotExist() {
          if (!scope.availableTabs[scope.activeTab]) {
            var orderedTabs = ['question', 'profile', 'supportingMaterial'];
            scope.activeTab = _.find(orderedTabs, function(t) {
              return scope.availableTabs[t];
            });
          }
        }
      }
  }
]);