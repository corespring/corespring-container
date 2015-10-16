(function() {

  "use strict";

  angular.module('corespring-editor.controllers')
    .controller('ProfileController', [
      '$location',
      '$q',
      '$scope',
      '$timeout',
      'CollectionService',
      'ConfigurationService',
      'DataQueryService',
      'DesignerService',
      'ItemService',
      'LogFactory',
      'ProfileFormatter',
      'StandardQueryCreator',
      'STATIC_PATHS',
      'EditorChangeWatcher',
      ProfileController
    ]);

  function ProfileController(
    $location,
    $q,
    $scope,
    $timeout,
    CollectionService,
    ConfigurationService,
    DataQueryService,
    DesignerService,
    ItemService,
    LogFactory,
    ProfileFormatter,
    StandardQueryCreator,
    STATIC_PATHS,
    EditorChangeWatcher
  ) {

    var $log = LogFactory.getLogger('ProfileController');

    //----------------------------------------------------------------
    // Form configuration
    // Form elements can be configured with the following properties
    // visible - hide/show a form element
    // readonly - make the element readonly/editable
    // value - set the value of the element. Multi select fields take an array as value.
    // options - set the options for an element that allows selecting like a combo box.
    // collapse - collapse/expand an element, applies to elements in a collapsible container only, see jade
    //
    // The value for a form element is applied after the profile is loaded, thus it overrides the value
    // of the stored profile. When there is no value property in the formModel, the original value is left untouched.
    // The options are applied as angular filter (see jade). Only if an option is in the original data
    // it will be used. When there is no options property in the formModel, no filtering is applied.
    //----------------------------------------------------------------

    /**
     * The default form models. Can be overridden by passing in values through the editor constructor.
     * The values passed-in are accessible from here through the ConfigurationService.
     */
    $scope.formModels = {
      additionalMediaCopyrights: {
        visible: true,
        readonly: false,
        collapse: true
      },
      author: {
        visible: true,
        readonly: false
      },
      contributor: {
        visible: true,
        readonly: false
      },
      bloomsTaxonomy: {
        visible: true,
        readonly: false,
        collapse: true
      },
      componentTypes: {
        visible: true,
        readonly: false
      },
      collectionId: {
        visible: true,
        readonly: false
      },
      copyrightExpirationDate: {
        visible: true,
        readonly: false
      },
      copyrightInformationPanel: {
        visible: true,
        collapse: true
      },
      copyrightOwner: {
        visible: true,
        readonly: false
      },
      copyrightYear: {
        visible: true,
        readonly: false
      },
      credentials: {
        visible: true,
        readonly: false
      },
      credentialsOther: {
        //here you can only set the value if the value of credentials is 'Other'
        //visibility and readonly are controlled by the formModel for credentials
      },
      depthOfKnowledge: {
        visible: true,
        readonly: false,
        collapse: true
      },
      description: {
        visible: true,
        readonly: false
      },
      gradeLevel: {
        visible: true,
        readonly: false
      },
      keySkills: {
        visible: true,
        readonly: false,
        collapse: true
      },
      lexile: {
        visible: true,
        readonly: false,
        collapse: true
      },
      licenseType: {
        visible: true,
        readonly: false,
        collapse: true
      },
      primarySubject: {
        visible: true,
        readonly: false
      },
      priorGradeLevel: {
        visible: true,
        readonly: false
      },
      priorUse: {
        visible: true,
        readonly: false
      },
      priorUseOther: {
        //here you can only set the value if the value of priorUse is 'Other'
        //visibility and readonly are controlled by the formModel for priorUse
      },
      priorUsePanel: {
        visible: true,
        collapse: true
      },
      relatedSubject: {
        visible: true,
        readonly: false
      },
      reviewsPassed: {
        visible: true,
        readonly: false,
        collapse: true
      },
      reviewsPassedOther: {
        //here you can only set the value if the value of reviewsPassed is 'Other'
        //visibility and readonly are controlled by the formModel for reviewsPassed
      },
      sourceUrl: {
        visible: true,
        readonly: false
      },
      standards: {
        visible: true,
        readonly: false,
        collapse: true
      },
      title: {
        visible: true,
        readonly: false
      }
    };

    /**
     * Update a single formModel with the values from a config
     * @param model
     * @param config
     */
    function updateFormModel(model, config) {
      if (!config) {
        return;
      }
      if (config.hasOwnProperty("visible")) {
        model.visible = config.visible === true;
      }
      if (config.hasOwnProperty("readonly")) {
        model.readonly = config.readonly === true;
      }
      if (config.hasOwnProperty("value")) {
        model.value = config.value;
      }
      if (config.hasOwnProperty("options")) {
        model.options = config.options;
      }
      if (config.hasOwnProperty("collapse")) {
        model.collapse = config.collapse !== false;
      }
    }

    /**
     * Walk through all formModels and update them from the config that has been passed in
     * @param formModels
     * @param config
     */
    function updateFormModels(config) {
      if (!config) {
        return;
      }
      _.forOwn($scope.formModels, function(value, key) {
        updateFormModel(value, config[key]);
      });
    }

    /**
     * Get the json encoded configuration from the "config" query parameter
     * @returns {*}
     */
    function getFormConfigFromUrl() {
      var search = $location.search();
      var hash = $location.hash();
      var configJson = search.profileConfig || hash.profileConfig;
      if (configJson) {
        try {
          var config = JSON.parse(configJson);
          return config;
        } catch (e) {
          $log.warn("error parsing config json", configJson, e);
        }
      }
      return null;
    }

    //We are loading config from the url. Might not be necessary, but doesn't hurt.
    updateFormModels(getFormConfigFromUrl());

    /**
     * Once the profile is loaded, we can use the formModels
     * to update the profile with the configured values
     * @param profile
     * @param config
     */
    function overrideProfileValuesWithConfig(item, config) {

      var profile = item.profile;

      applyConfig(item, "collectionId", "collectionId", configToCollectionId);

      applyConfig(profile.taskInfo, "title");
      applyConfig(profile.taskInfo, "description");
      applyConfig(profile.taskInfo.subjects, 'primary', 'primarySubject', configToPrimarySubject);
      applyConfig(profile.taskInfo.subjects, 'related', 'relatedSubject', configToRelatedSubject);
      applyConfig(profile.taskInfo, "gradeLevel");

      applyConfig(profile, 'standards', 'standards', configToStandards);
      applyConfig(profile, "lexile");

      applyConfig(profile.otherAlignments, "depthOfKnowledge");
      applyConfig(profile.otherAlignments, "bloomsTaxonomy");
      applyConfig(profile.otherAlignments, "keySkills");

      applyConfig(profile, "priorUse");
      applyConfig(profile, "priorUseOther");
      applyConfig(profile, "priorGradeLevel");
      applyConfig(profile, "reviewsPassed");
      applyConfig(profile, "reviewsPassedOther");

      applyConfig(profile.contributorDetails, "author");
      applyConfig(profile.contributorDetails, "contributor");
      applyConfig(profile.contributorDetails, "credentials");
      applyConfig(profile.contributorDetails, "credentialsOther");
      applyConfig(profile.contributorDetails, "copyrightOwner");
      applyConfig(profile.contributorDetails, "copyrightYear");
      applyConfig(profile.contributorDetails, "copyrightExpirationDate");
      applyConfig(profile.contributorDetails, "sourceUrl");
      applyConfig(profile.contributorDetails, "licenseType");

      applyConfig(profile.contributorDetails, "additionalCopyrights", 'additionalMediaCopyrights');


      /**
       * Apply the configured value to the destination object
       * @param dest - the host object for the property to set
       * @param name - the name of the property to set in the host
       * @param configName - the name of the formModel in config, optional, uses name instead, if not set
       * @param getValue - an optional function(configuredValue, callback) to get the real value
       * for the configuredValue. The function passes the real value to the callback, which then assigns
       * it to the destination.
       */
      function applyConfig(dest, name, configName, getValue) {
        configName = configName || name;

        var configItem = config[configName];
        if (!configItem || !configItem.hasOwnProperty('value')) {
          return;
        }

        if (_.isFunction(getValue)) {
          getValue(configItem.value, function(result) {
            dest[name] = result;
          });
        } else {
          dest[name] = configItem.value;
        }
      }
    }

    /**
     * Create a ng filter function for a formModel/dataProvider
     * This filter returns true if the item can be found in formModel.options
     * or if there are no options
     * @param formModel - holds the options that are used for filtering
     * @returns a filter function
     */
    function createSimpleOptionsFilter(formModel) {
      return function(item, index) {
        return _.isArray(formModel.options) ?
          _.contains(formModel.options, item) : true;
      };
    }

    /**
     * Create a ng filter function for a formModel/dataProvider
     * This filter returns true if the item can be found in formModel.options
     * or if there are no options
     * @param formModel - holds the options that are used for filtering
     * @param property - pass in a string if you want to compare item[property]
     * @returns a filter function
     */
    function createPropertyOptionsFilter(formModel, property) {
      return function(item, index) {
        return _.isArray(formModel.options) ?
          _.contains(formModel.options, item[property]) : true;
      };
    }

    /**
     * Create a ng filter function for a formModel/dataProvider
     * This filter returns true if the item can be found in formModel.options
     * or if there are no options
     * @param formModel - holds the options that are used for filtering
     * @param properties - pass in an array of strings to compare item[properties[0]] OR item[properties[1]]
     * @returns a filter function
     */
    function createMultiplePropertiesOptionsFilter(formModel, properties) {
      return function(item, index) {
        return _.isArray(formModel.options) ?
          _.some(properties, function(property) {
            return _.contains(formModel.options, item[property]);
          }) : true;
      };
    }

    //----------------------------------------------------------------
    // Standards
    //----------------------------------------------------------------

    /**
     * The standards selection consists of three select boxes and a
     * select2 search & multi select tag field
     * The three selections are filled from the standardsTree
     * The selected values are used as filters for the select2 search field
     */

    $scope.standardsTree = [];

    DataQueryService.list("standardsTree", function(result) {
      $scope.standardsTree = result;
    });

    $scope.standardFilterOption = {
      subject: {},
      category: {},
      subCategory: {}
    };

    $scope.standardFilterPlaceholder = {
      subject: 'Choose one',
      category: 'Choose one',
      subCategory: 'Choose one'
    };

    $scope.$watch('standardFilterOption', function(options) {
      if (!options.subject) {
        options.subject = {
          items: []
        };
      }
      if (_.isEmpty(options.subject.items)) {
        options.category = {
          items: []
        };
      }
      if (_.isEmpty(options.category.items)) {
        options.subCategory = {
          items: []
        };
      }

      $scope.standardFilterPlaceholder.category = _.isEmpty(options.subject.items) ? 'Not assigned' : 'Choose one';
      $scope.standardFilterPlaceholder.subCategory = _.isEmpty(options.category.items) ? 'Not assigned' : 'Choose one';
    }, true); //watch nested properties

    function createStandardQuery(searchText) {
      return StandardQueryCreator.createStandardQuery(searchText);
    }

    function createFilteredStandardQuery(searchText) {
      return StandardQueryCreator.createStandardQuery(
        searchText,
        $scope.standardFilterOption.subject,
        $scope.standardFilterOption.category,
        $scope.standardFilterOption.subCategory);
    }

    function filterStandardsByConfig(standards) {
      var options = $scope.formModels.standards.options;
      if (!_.isArray(options)) {
        return standards;
      }

      return _.filter(standards, function(item) {
        return -1 !== _.indexOf(options, item.dotNotation);
      });
    }

    $scope.standardsAdapter = {
      tags: [],
      allowClear: true,
      minimumInputLength: 1,
      placeholder: "Begin by typing a standard or skill.",

      query: function(query) {
        DataQueryService.query("standards", createStandardQuery(query.term), function(results) {
          query.callback({
            //Most other dataProviders are filtered through a ng filter function that is applied in jade
            //This filter here is applied directly bc. in jade we don't have access to the dataProvider.
            results: filterStandardsByConfig(results)
          });
        });
      },

      initSelection: function(element, callback) {

      },

      formatSelection: function(standard) {
        $timeout(function() {
          $(".standard-adapter-result").tooltip();
        }, 500);
        return "<span class='standard-adapter-result' data-title='" + standard.standard + "'>" + standard.dotNotation + "</span>";
      },

      formatResult: function(standard) {
        return "<blockquote>" +
          '<p>' + standard.standard + '</p>' +
          '<small>' + standard.dotNotation + ', ' + standard.subject + ', ' + standard.subCategory + '</small>' +
          '<small>' + standard.category + '</small>' +
          '</blockquote>';
      },

      formatResultCssClass: function(object) {
        return "select2-item-profile-standard-adapter-drop-down-item";
      }
    };

    $scope.standardsAdapter.initSelection = $scope.standardsAdapter.initSelection.bind($scope.standardsAdapter);

    $scope.filterStandardsAdapter = _.clone($scope.standardsAdapter);
    $scope.filterStandardsAdapter.placeholder = '';
    $scope.filterStandardsAdapter.minimumInputLength = 0;
    $scope.filterStandardsAdapter.initSelection = function(element, callback) {
      DataQueryService.query("standards", createFilteredStandardQuery(""), function(results) {
        query.callback({
          results: filterStandardsByConfig(results)
        });
      });
    };
    $scope.filterStandardsAdapter.query = function(query) {
      DataQueryService.query("standards", createFilteredStandardQuery(query.term), function(results) {
        query.callback({
          results: filterStandardsByConfig(results)
        });
      });
    };

    /**
     * The config contains an array of standards in dotNotation.
     * For each item we need to load the full standard object
     */
    function configToStandards(dotNotations, callback) {
      if (!_.isArray(dotNotations) || 0 === dotNotations.length) {
        return;
      }

      var results = [];
      _.forEach(dotNotations, function(dotNotation) {
        DataQueryService.query('standards', {
            searchTerm: dotNotation
          },
          function(item) {
            results.push(item[0]);
            if (dotNotations.length === results.length) {
              callback(results);
            }
          });
      });
    }

    function containsLiteracyStandard(standards) {
      return -1 !== _.findIndex(standards, function(item) {
        return item && item.subject && item.subject.toLowerCase().indexOf("literacy") >= 0;
      });
    }

    function getStandardDomain(item) {
      if (item && item.uri) {
        var parts = item.uri.toLowerCase().split('/');
        while (parts.length > 0) {
          var part = parts.shift();
          if (part !== '' && part !== 'http:' && part !== 'https:') {
            return part;
          }
        }
      }
      return 'standard';
    }

    function getImageUrlForStandardDomain(domain) {
      //TODO Get official logos
      return STATIC_PATHS.assets + '/standards/common-core.png';
    }

    function getStandardsGroups() {
      var results = [];
      var groups = _.groupBy($scope.profile.standards, getStandardDomain);
      _.forEach(groups, function(item, key) {
        var imageUrl = getImageUrlForStandardDomain(key);
        results.push({
          label: key,
          standards: _.map(item, function(s) {
            return {
              id: s.id,
              text: s.dotNotation
            };
          }),
          imageUrl: imageUrl,
          hasImage: !!imageUrl
        });
      });
      return results;
    }

    function getStandardsClusters() {
      console.log($scope.profile.standards);
      return _($scope.profile.standards).map(function(s) {
         switch (s.subject) {
           case "Math":
             return s.category;
           case "ELA":
           case "ELA-Literacy":
             return s.subCategory;
         }
      }).uniq().value();
    }


    $scope.$watch('profile.standards', function(newValue, oldValue) {
      if ($scope.profile && $scope.profile.standards) {
        $scope.isLiteracyStandardSelected = containsLiteracyStandard(newValue);
        $scope.standardsGroups = getStandardsGroups();
        $scope.standardsClusters = getStandardsClusters();
      }
    });

    $scope.$watch('standardsGroups', function(newValue, oldValue) {
      if ($scope.profile && $scope.profile.standards && $scope.standardsGroups) {
        var newStandards = _.chain(newValue).pluck('standards').flatten().pluck('id').value();
        var oldStandards = _.chain($scope.profile.standards).pluck('id').value();
        if (newStandards.length < oldStandards.length) {
          var dif = _.difference(oldStandards, newStandards);
          _.remove($scope.profile.standards, function(item) {
            return item && _.contains(dif, item.id);
          });
        }
      }
    }, true); //watch nested properties

    //----------------------------------------------------------------
    // list of component types used in the item
    //----------------------------------------------------------------

    DesignerService.loadAvailableUiComponents(function(comps) {
      $scope.availableComponents = [].concat(comps.interactions).concat(comps.widgets);
      initComponentTypesUsed();
    });

    function initComponentTypesUsed() {
      if (!$scope.item || !$scope.item.components || !$scope.availableComponents) {
        return;
      }

      //As per request from Gwen we only display the name, not the count
      function simpleFormat(name, count) {
        return name;
      }

      $scope.componentTypes = ProfileFormatter.componentTypesUsed(
        $scope.item.components, $scope.availableComponents, simpleFormat);
    }

    //----------------------------------------------------------------
    // list of collections
    //----------------------------------------------------------------

    $scope.collectionIdFilter = createMultiplePropertiesOptionsFilter($scope.formModels.collectionId, ['key', 'value']);
    CollectionService.list().then(setCollectionIdDataProvider);

    function setCollectionIdDataProvider(collections) {
      $scope.collectionIdDataProvider = _.sortBy(collections, 'value');
    }

    function configToCollectionId(configuredValue, callback) {
      CollectionService.list().then(setCollectionForConfig);

      function setCollectionForConfig(collections) {
        var configuredCollection = _.find(collections, function(item) {
          return item && (item.key === configuredValue || item.value === configuredValue);
        });
        if (configuredCollection) {
          callback(configuredCollection.key);
        }
      }
    }

    function setDefaultCollectionIfNoCollectionSelected(collectionId) {
      CollectionService.list().then(function(collections) {
        $log.log("setDefaultCollectionIfNoCollectionSelected", collectionId, collections);
        if (!collectionById(collections, collectionId)) {
          $log.log("setDefaultCollectionIfNoCollectionSelected id not found", collectionId);
          var defaultCollection = collectionByName(collections, 'default');
          $log.log("setDefaultCollectionIfNoCollectionSelected defaultCollection", defaultCollection);
          if (defaultCollection) {
            $log.log("setDefaultCollectionIfNoCollectionSelected saving");
            $scope.saveCollectionId(defaultCollection.key);
          }
        }
      });
    }

    function collectionById(collections, id) {
      return _.find(collections, {
        key: id
      });
    }

    function collectionByName(collections, name) {
      var lcName = _.isString(name) ? name.toLowerCase() : '';
      return _.find(collections, function(c) {
        return c && _.isString(c.value) && c.value.toLowerCase() === lcName;
      });
    }

    //----------------------------------------------------------------
    // subject and related subject
    //----------------------------------------------------------------

    function SubjectSelect2Adapter(topic, formModel) {

      this.formatResult = subjectText;
      this.formatSelection = subjectText;

      function filterSubjectsByConfig(subjects) {
        var options = formModel.options;
        if (!_.isArray(options)) {
          return subjects;
        }
        options = _.map(options, fromSubjectText);
        return _.filter(subjects, function(item) {
          return -1 !== _.findIndex(options, function(o) {
            return item && o && item.category === o.category && item.subject === o.subject;
          });
        });
      }

      this.query = function(query) {
        DataQueryService.query(topic, {
            searchTerm: query.term
          },
          function(result) {
            query.callback({
              //Most other dataProviders are filtered through a ng filter function that is applied in jade
              //This filter here is applied directly bc. in jade we don't have access to the dataProvider.
              results: filterSubjectsByConfig(result)
            });
          });
      };

      this.initSelection = function() {
        //keep this to avoid exceptions in the select
      };
    }

    function subjectText(s) {
      return s.category + ": " + s.subject;
    }

    function fromSubjectText(categorySubject) {
      var parts = categorySubject.split(":");
      return {
        category: parts[0].trim(),
        subject: parts.length >= 2 ? parts[1].trim() : ''
      };
    }

    $scope.primarySubjectSelect2Adapter = new SubjectSelect2Adapter("subjects.primary", $scope.formModels.primarySubject);
    $scope.relatedSubjectSelect2Adapter = new SubjectSelect2Adapter("subjects.related", $scope.formModels.relatedSubject);

    function findSubjectByCategorySubject(topic, categorySubject, callback) {
      var query = {
        filters: fromSubjectText(categorySubject)
      };
      DataQueryService.query(
        topic,
        query,
        function(item) {
          callback(item[0]);
        });
    }

    /**
     * The config is a category: subject string.
     */
    function configToPrimarySubject(categorySubject, callback) {
      if (!_.isString(categorySubject)) {
        return;
      }

      findSubjectByCategorySubject('subjects.primary', categorySubject, callback);
    }

    /**
     * The config is a list of category: subject strings.
     */
    function configToRelatedSubject(categorySubjectList, callback) {
      if (!_.isArray(categorySubjectList)) {
        return;
      }

      var results = [];
      _.forEach(categorySubjectList, function(categorySubject) {

        findSubjectByCategorySubject('subjects.related', categorySubject, function(result) {
          results.push(result);
          if (results.length === categorySubjectList.length) {
            callback(results);
          }
        });
      });
    }

    //----------------------------------------------------------------
    // some dataProviders for selects
    //----------------------------------------------------------------

    $scope.bloomsTaxonomyFilter = createPropertyOptionsFilter($scope.formModels.bloomsTaxonomy, 'key');

    DataQueryService.list("bloomsTaxonomy", function(result) {
      $scope.bloomsTaxonomyDataProvider = result;
    });

    $scope.depthOfKnowledgeFilter = createPropertyOptionsFilter($scope.formModels.depthOfKnowledge, 'key');

    DataQueryService.list("depthOfKnowledge", function(result) {
      $scope.depthOfKnowledgeDataProvider = result;
    });

    DataQueryService.list("gradeLevels", function(result) {
      $scope.gradeLevelDataProvider = result;
      $scope.gradeLevelFilter = createPropertyOptionsFilter($scope.formModels.gradeLevel, 'key');
      $scope.priorGradeLevelDataProvider = result;
      $scope.priorGradeLevelFilter = createPropertyOptionsFilter($scope.formModels.priorGradeLevel, 'key');
    });

    //----------------------------------------------------------------
    // copyright related dates
    //----------------------------------------------------------------

    /**
     * Return an array of consecutive numbers
     * @param fromYear
     * @param toYear
     * @returns {*}
     */
    function years(fromYear, toYear) {
      var direction = fromYear > toYear ? -1 : 1;
      return _.range(fromYear, toYear + 1 * direction, direction).map(function(year) {
        return year.toString();
      });
    }

    $scope.copyrightExpirationDateFilter = createSimpleOptionsFilter($scope.formModels.copyrightExpirationDate);

    $scope.copyrightExpirationDateDataProvider = years(new Date().getFullYear(), new Date().getFullYear() + 20).concat(['Never']);

    $scope.copyrightYearFilter = createSimpleOptionsFilter($scope.formModels.copyrightYear);

    $scope.copyrightYearDataProvider = years(new Date().getFullYear(), new Date().getFullYear() - 120);

    //----------------------------------------------------------------
    // credentials
    //----------------------------------------------------------------

    $scope.credentialsFilter = createPropertyOptionsFilter($scope.formModels.credentials, 'key');

    DataQueryService.list("credentials", function(result) {
      $scope.credentialsDataProvider = result;
      updateCredentialsOtherSelected();
    });

    $scope.$watch('contributorDetails.credentials', function() {
      updateCredentialsOtherSelected();
    });

    function updateCredentialsOtherSelected() {
      var otherSelected = $scope.contributorDetails && 'Other' === $scope.contributorDetails.credentials;
      if ($scope.isCredentialsOtherSelected && !otherSelected) {
        $scope.contributorDetails.credentialsOther = '';
      }
      $scope.isCredentialsOtherSelected = otherSelected;
    }

    //----------------------------------------------------------------
    // key skills
    //----------------------------------------------------------------

    $scope.keySkillsFilter = createPropertyOptionsFilter($scope.formModels.keySkills, 'key');

    function initKeySkillsDataProvider() {
      DataQueryService.list("keySkills", function(result) {
        $scope.keySkillsDataProvider = _.chain(result).pluck('value').flatten().uniq().sort().map(function(item) {
          return {
            key: item,
            value: item
          };
        }).value();
        initKeySkillsSelection();
        updateKeySkillsTitle();
      });
    }

    function initKeySkillsSelection() {
      if (!$scope.keySkillsDataProvider || !$scope.otherAlignments) {
        return;
      }
      var selectedKeySkills = _.isArray($scope.otherAlignments.keySkills) ? $scope.otherAlignments.keySkills : [];

      _.forEach($scope.keySkillsDataProvider, function(item) {
        var selected = _.contains(selectedKeySkills, item.key);
        if (selected !== item.selected) {
          item.selected = selected;
        }
      });
      $scope.keySkillsDataProvider = _.clone($scope.keySkillsDataProvider);
    }

    function updateKeySkillsTitle() {
      if ($scope.otherAlignments && $scope.otherAlignments.keySkills) {
        $scope.keySkillsTitle = "<span class='key-skills'>Key Skills <span class='badge'>" + $scope.otherAlignments.keySkills.length + "</span> <span class='selected'>selected.</span></span>";
      }
    }

    $scope.onChangeKeySkill = function() {
      updateKeySkillsInProfile();
      updateKeySkillsTitle();
    };

    function updateKeySkillsInProfile() {
      if (!$scope.keySkillsDataProvider || !$scope.otherAlignments) {
        return;
      }
      var keySkills = [];
      _.forEach($scope.keySkillsDataProvider, function(item) {
        if (item.selected) {
          keySkills.push(item.key);
        }
      });
      $scope.otherAlignments.keySkills = keySkills;
    }

    //----------------------------------------------------------------
    // prior use
    //----------------------------------------------------------------

    $scope.priorUseFilter = createPropertyOptionsFilter($scope.formModels.priorUse, 'key');

    $scope.$watch('profile.priorUse', function() {
      updatePriorUseOtherSelected();
    });

    DataQueryService.list("priorUses", function(result) {
      $scope.priorUseDataProvider = result;
      updatePriorUseOtherSelected();
    });

    function updatePriorUseOtherSelected() {
      var otherSelected = $scope.profile && 'Other' === $scope.profile.priorUse;
      if ($scope.isPriorUseOtherSelected && !otherSelected) {
        $scope.profile.priorUseOther = '';
      }
      $scope.isPriorUseOtherSelected = otherSelected;
    }

    //----------------------------------------------------------------
    // reviews passed
    //----------------------------------------------------------------

    $scope.reviewsPassedFilter = createPropertyOptionsFilter($scope.formModels.reviewsPassed, 'key');

    DataQueryService.list("reviewsPassed", function(result) {
      $scope.reviewsPassedDataProvider = result;
      updateReviewsPassedOtherSelected();
    });


    function updateReviewsPassedOtherSelected() {
      if (!$scope.profile) {
        return;
      }
      var otherSelected = _.contains($scope.profile.reviewsPassed, 'Other');
      if ($scope.isReviewsPassedOtherSelected && !otherSelected) {
        $scope.profile.reviewsPassedOther = '';
      }
      $scope.isReviewsPassedOtherSelected = otherSelected;
    }

    $scope.$watch('profile.reviewsPassed', function(newValue, oldValue) {
      if (!$scope.profile || !$scope.reviewsPassedDataProvider) {
        return;
      }

      function noop() {}

      function setNone() {
        $scope.profile.reviewsPassed = [];
      }

      function setAll() {
        $scope.profile.reviewsPassed = _.chain($scope.reviewsPassedDataProvider).pluck('value').without('Other')
          .union(newValue).without('None', 'All').value();
      }

      var updateAction = noop;
      if (_.contains(newValue, 'None')) {
        updateAction = setNone;
      } else if (_.contains(newValue, 'All')) {
        updateAction = setAll;
      }
      $timeout(function() {
        updateAction();
        updateReviewsPassedOtherSelected();
      });
    });

    //----------------------------------------------------------------
    // show image for license type
    //----------------------------------------------------------------

    $scope.licenseTypeFilter = createPropertyOptionsFilter($scope.formModels.licenseType, 'key');

    DataQueryService.list("licenseTypes", function(result) {
      $scope.licenseTypeDataProvider = result;
    });

    $scope.getLicenseTypeUrl = function(licenseType) {
      return licenseType ? STATIC_PATHS.assets + '/licenseTypes/' + licenseType.replace(" ", "-") + '.png' : undefined;
    };

    $scope.togglePreview = function() {
      $scope.previewOn = !$scope.previewOn;
    };

    //----------------------------------------------------------------
    // profile initialisation
    //----------------------------------------------------------------

    function setItem(item) {
      var profile = item.profile = item.profile || {};

      if (!(profile.taskInfo)) {
        profile.taskInfo = {};
      }
      if (!(profile.taskInfo.subjects)) {
        profile.taskInfo.subjects = {};
      }
      if (!_.isArray(profile.reviewsPassed)) {
        profile.reviewsPassed = [];
      }
      if (!_.isArray(profile.standards)) {
        profile.standards = [];
      }
      if (!(profile.otherAlignments)) {
        profile.otherAlignments = {};
      }
      if (!_.isArray(profile.otherAlignments.keySkills)) {
        profile.otherAlignments.keySkills = [];
      }

      if (!(profile.contributorDetails)) {
        profile.contributorDetails = {};
      }

      var contributorDetails = profile.contributorDetails;

      if (!(contributorDetails.licenseType)) {
        contributorDetails.licenseType = "CC BY";
      }

      if (!(contributorDetails.copyrightYear)) {
        contributorDetails.copyrightYear = (new Date().getFullYear()).toString();
      }

      if (_.isArray(contributorDetails.additionalCopyrights)) {
        removeEmptyAdditionalCopyrightItems(contributorDetails.additionalCopyrights);
      } else {
        contributorDetails.additionalCopyrights = [];
      }

      overrideProfileValuesWithConfig(item, $scope.formModels);

      $scope.item = item;
      $scope.profile = profile;
      $scope.taskInfo = profile.taskInfo;
      $scope.otherAlignments = profile.otherAlignments;
      $scope.contributorDetails = profile.contributorDetails;
      $scope.collectionId = item.collection ? item.collection.id : '';

      initComponentTypesUsed();
      initKeySkillsDataProvider();
      updateReviewsPassedOtherSelected();
      updatePriorUseOtherSelected();
      updateCredentialsOtherSelected();
      setDefaultCollectionIfNoCollectionSelected($scope.collectionId);
    }

    function removeEmptyAdditionalCopyrightItems(copyrights) {

      function itemIsEmpty(item) {
        return !item || _.every(item, function(val) {
          return !val;
        });
      }

      _.remove(copyrights, itemIsEmpty);
    }

    //----------------------------------------------------------------
    // profile load and save
    //----------------------------------------------------------------
    
    $scope.saveProfile = function(){
      $log.log("saving profile");
      ItemService.saveProfile($scope.item.profile, function(result) {
        $log.log("profile saved result:", result);
      });
    };

    $scope.$watch('item.profile', EditorChangeWatcher.makeWatcher(
      'profile', 
      $scope.saveProfile,
      $scope), true);


    $scope.loadProfile = function() {
      $log.log("loading profile");
      ItemService.load(function(item) {
        $log.log('item loading success hasItem:' + (!!item), item);
        if (item) {
          ConfigurationService.getConfig(function(config) {
            $log.log('getConfig callback', config);
            updateFormModels(config.get('profileConfig', {}));
            $timeout(function() {
              setItem(item);
            }, 2000);
          });
        } else {
          $log.error('error loading profile, item is null');
        }
      }, function(err) {
        $log.error('error loading profile', err);
      });
    };

    //----------------------------------------------------------------
    // collectionId load and save
    //----------------------------------------------------------------

    $scope.$watch('collectionId', function(newValue, oldValue) {
      $log.log("$watch collectionId", newValue);
      if (undefined === oldValue) {
        return;
      }
      if (_.isEqual(oldValue, newValue)) {
        return;
      }
      $scope.saveCollectionId(newValue);
    });

    $scope.saveCollectionId = function(collectionId) {
      $log.log("saving collectionId", collectionId);
      ifCollectionIdIsValid(collectionId).then(function(collection) {
        $log.log("id is valid", collectionId, collection);
        updateItemCollection(collection);
        $scope.collectionId = collection.key;
        ItemService.saveCollectionId(collectionId, function(result) {
          $log.log("collectionId saved result:", result);
        });
      });
    };

    function ifCollectionIdIsValid(collectionId){
      var defer = $q.defer();
      CollectionService.list().then(function(collections) {
        var collection = _.find(collections, {key:collectionId});
        $log.log("ifCollectionIdIsValid collections", collectionId, collection, collections);
        if (collection) {
          defer.resolve(collection);
        } else {
          defer.reject(collectionId);
        }
      });
      return defer.promise;
    }

    function updateItemCollection(collection){
      $scope.item.collection = {
        id: collection.key,
        name: collection.value
      };
      $scope.$emit('itemChanged', {
        partChanged: 'collectionId'
      });
    }



    //----------------------------------------------------------------
    // startup
    //----------------------------------------------------------------

    $scope.loadProfile();

  }

})();