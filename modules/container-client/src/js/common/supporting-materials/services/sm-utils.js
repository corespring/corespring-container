  angular.module('corespring-common.supporting-materials.services')
    .service('SmUtils', 
      [ 'SupportingMaterialUrls', 'QueryParamUtils',
      function(SupportingMaterialUrls, QueryParamUtils) {

        function SmUtils() {
          
          this.formatKB = function(kb) {
            if (isNaN(kb)) {
              return '--';
            } else if(kb < 1024){
              return kb.toFixed(0) + 'kb'; 
            } else {
              var mb = kb / 1024;
              return mb.toFixed(1) + 'mb';
            }
          };

          this.mainFile = function(m) {
            return _.find(m.files, function(f) {
              return f.isMain === true;
            });
          };

          this.addQueryParamsIfPresent = function(path) {
            return QueryParamUtils.addQueryParams(path);
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

            var sortedKeys = _.keys(keyMap).sort();
            return _.map(sortedKeys, toObject);
          };
        }

        return new SmUtils();
      }
    ]);