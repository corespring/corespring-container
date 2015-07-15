(function () {

  angular.module('corespring-common.services')
    .service('StandardQueryCreator',
    [
      '$log',
      StandardQueryCreator
    ]
  );

  function StandardQueryCreator($log) {

    this.createStandardQuery = function (searchText, subjectOption, categoryOption, subCategoryOption) {
      $log.debug("StandardQueryCreator.createStandardQuery", searchText, subjectOption, categoryOption, subCategoryOption);

      function createQuery(searchTerm) {
        var result = _.isEmpty(searchTerm) ? {} : {
          searchTerm: searchTerm
        };
        return result;
      }

      function isAllSelected(item) {
        return !item || !item.name || _.isString(item.name) && item.name.toLowerCase() === "all";
      }

      /**
       * Add key/value to filter if item.name is not empty and is not 'all'
       * Return true, if a filter has been added
       */
      function addFilterIfApplicable(item, query, field) {
        if (isAllSelected(item)) {
          return false;
        }
        query.filters = query.filters || {};
        query.filters[field] = item.name;
        return true;
      }

      if (isAllSelected(subjectOption)) {
        return createQuery(searchText);
      }

      var query = createQuery(searchText);

      if (addFilterIfApplicable(subjectOption, query, "subject")) {
        if (addFilterIfApplicable(categoryOption, query, "category")) {
          addFilterIfApplicable(subCategoryOption, query, "subCategory");
        }
      }

      return query;
    };

  }

})();


