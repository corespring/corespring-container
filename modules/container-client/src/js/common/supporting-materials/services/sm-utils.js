  angular.module('corespring-common.supporting-materials.services')
    .service('SmUtils', [ '$document', 'SupportingMaterialUrls',
      function($document, SupportingMaterialUrls) {

        function SmUtils() {

          this.mainFile = function(m) {
            return _.find(m.files, function(f) {
              return f.isMain === true;
            });
          };

          this.addQueryParamsIfPresent = function(path) {
            var href = $document[0].location.href;
            return path + (href.indexOf('?') === -1 ? '' : '?' + href.split('?')[1]);
          };


          this.getBinaryUrl = function(m, file){
            return this.addQueryParamsIfPresent(SupportingMaterialUrls.getAsset.url
              .replace(':name', m.name)
              .replace(':filename', file.name));
          };

          this.group = function(materialsList, groupByKey) {
            var keyMap = _.groupBy(materialsList, groupByKey);

            function toObject(k) {
              return {
                name: k,
                items: keyMap[k]
              };
            }

            return _(keyMap).keys().map(toObject).value();
          };
        }

        return new SmUtils();
      }
    ]);