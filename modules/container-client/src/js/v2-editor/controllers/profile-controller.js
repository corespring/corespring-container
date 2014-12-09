(function() {

  "use strict";

  angular.module('corespring-editor.controllers')
    .controller('ProfileController', [
      '$location',
      '$scope',
      'throttle',
      'ConfigurationService',
      'DataQueryService',
      'DesignerService',
      'ItemService',
      'LogFactory',
      'ProfileFormatter',
      'StandardQueryCreator',
      ProfileController
    ]);

  function ProfileController(
    $location,
    $scope,
    throttle,
    ConfigurationService,
    DataQueryService,
    DesignerService,
    ItemService,
    LogFactory,
    ProfileFormatter,
    StandardQueryCreator) {

    var $log = LogFactory.getLogger('ProfileController');

    //----------------------------------------------------------------
    // Form configuration
    //----------------------------------------------------------------

    $scope.formModels = {
      title: {
        visible:true,
        readonly:false
      },
      description: {
        visible:true,
        readonly:false
      },
      primarySubject: {
        visible:true,
        readonly:false
      },
      relatedSubject: {
        visible:true,
        readonly:false
      },
      gradeLevel: {
        visible:true,
        readonly:false
      },
      componentTypes: {
        visible:true,
        readonly:false
      },
      //--------------------
      standards: {
        visible:true,
        readonly:false
      },
      lexile: {
        visible:true,
        readonly:false
      },
      //--------------------
      depthOfKnowledge: {
        visible:true,
        readonly:false
      },
      bloomsTaxonomy: {
        visible:true,
        readonly:false
      },
      keySkills: {
        visible:true,
        readonly:false
      },
      //--------------------
      priorUsePanel: {
        visible:true,
        readonly:false
      },
      priorUse: {
        visible:true,
        readonly:false
      },
      priorUseOther: {
        visible:true,
        readonly:false
      },
      priorGradeLevel: {
        visible:true,
        readonly:false
      },
      reviewsPassed: {
        visible:true,
        readonly:false
      },
      reviewsPassedOther: {
        visible:true,
        readonly:false
      },
      //--------------------
      copyrightInformationPanel: {
        visible:true,
        readonly:false
      },
      author: {
        visible:true,
        readonly:false
      },
      credentials: {
        visible:true,
        readonly:false
      },
      credentialsOther: {
        visible:true,
        readonly:false
      },
      copyrightOwner: {
        visible:true,
        readonly:false
      },
      copyrightYear: {
        visible:true,
        readonly:false
      },
      copyrightExpirationDate: {
        visible:true,
        readonly:false
      },
      sourceUrl: {
        visible:true,
        readonly:false
      },
      licenseType: {
        visible:true,
        readonly:false
      },
      //--------------------
      additionalCopyrights: {
        visible:true,
        readonly:false
      }
    };

    /**
     * Update a single formModel with the values from config
     * @param model
     * @param config
     */
    function updateFormModel(model, config){
      if(!config){
        return;
      }
      if(config.hasOwnProperty("visible")){
        model.visible = config.visible === true;
      }
      if(config.hasOwnProperty("readonly")){
        model.readonly = config.readonly === true;
      }
      if(config.hasOwnProperty("value")){
        model.value = config.value;
      }
      if(config.hasOwnProperty("options")){
        model.options = config.options;
      }
    }

    /**
     * Walk through all formModels and update them from config
     * @param formModels
     * @param config
     */
    function updateFormModels(config){
      if(!config){
        return;
      }
      _.forOwn($scope.formModels, function(value,key){
        updateFormModel(value, config[key]);
      });
    }

    /**
     * Get the json encoded configuration from the "config" query parameter
     * @returns {*}
     */
    function getFormConfigFromUrl(){
      var search = $location.search();
      var hash = $location.hash();
      var configJson = search.profileConfig || hash.profileConfig;
      if(configJson) {
        try {
          var config = JSON.parse(configJson);
          return config;
        } catch (e) {
          $log.warn("error parsing config json", configJson, e);
        }
      }
      return null;
    }

    updateFormModels(getFormConfigFromUrl());

    /**
     * Once the profile is loaded, we can use the formModels
     * to update the profile with the configured values
     * @param profile
     * @param config
     */
    function overrideProfileValuesWithConfig(profile, config){

      function applyConfig(dest, name, sourceName){
        var configItem = config[sourceName || name];
        if(configItem && configItem.hasOwnProperty('value')){
          dest[name] = configItem.value;
        }
      }

      function applyConfigAsynchronously(dest, name, configName, getConfig) {
        var configItem = config[configName];
        if (!configItem || !configItem.hasOwnProperty('value')) {
          return;
        }

        getConfig(configItem.value, function (result) {
          dest[name] = result;
        });
      }

      applyConfig(profile.taskInfo, "title");
      applyConfig(profile.taskInfo, "description");
      applyConfigAsynchronously(profile.taskInfo.subjects, 'primary', 'primarySubject', configToPrimarySubject);
      applyConfigAsynchronously(profile.taskInfo.subjects, 'related', 'relatedSubject', configToRelatedSubject);
      applyConfig(profile.taskInfo, "gradeLevel");

      applyConfigAsynchronously(profile, 'standards', 'standards', configToStandards);
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
      applyConfig(profile.contributorDetails, "credentials");
      applyConfig(profile.contributorDetails, "credentialsOther");
      applyConfig(profile.contributorDetails, "copyrightOwner");
      applyConfig(profile.contributorDetails, "copyrightYear");
      applyConfig(profile.contributorDetails, "copyrightExpirationDate");
      applyConfig(profile.contributorDetails, "sourceUrl");
      applyConfig(profile.contributorDetails, "licenseType");

      applyConfig(profile.contributorDetails, "additionalCopyrights");
    }

    /**
     * Create a ng filter function for a formModel/dataProvider
     * @param formModel
     * @param propertyName
     * @returns {Function}
     */
    function createOptionsFilter(formModel, propertyName){
      return function(item,index){
        var value = propertyName ? item[propertyName] : item;
        return _.isArray(formModel.options) ?
          _.contains(formModel.options, value)
          : true;
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

    $scope.$watch('standardFilterOption', function(options){
      if(!options.subject){
        options.subject = {items:[]};
      }
      if(_.isEmpty(options.subject.items)){
        options.category = {items:[]};
      }
      if(_.isEmpty(options.category.items)){
        options.subCategory = {items:[]};
      }

      $scope.standardFilterPlaceholder.category = _.isEmpty(options.subject.items) ? 'Not assigned' : 'Choose one';
      $scope.standardFilterPlaceholder.subCategory = _.isEmpty(options.category.items)? 'Not assigned' : 'Choose one';
    }, true); //watch nested properties

    function createStandardQuery(searchText) {
      return StandardQueryCreator.createStandardQuery(
          searchText,
          $scope.standardFilterOption.subject,
          $scope.standardFilterOption.category,
          $scope.standardFilterOption.subCategory);
    }

    function filterStandardsByConfig(standards){
      var options = $scope.formModels.standards.options;
      if(!_.isArray(options)){
        return standards;
      }

      return _.filter(standards, function(item){
        return -1 !== _.indexOf(options, item.dotNotation);
      });
    }


    $scope.standardsAdapter = {
      tags: [],
      allowClear: true,
      minimumInputLength: 1,
      placeholder: "Begin by typing a standard or skill.",

      getVal: function(element){
        return $(element).select2('val');
      },

      query: function(query) {
        DataQueryService.query("standards", createStandardQuery(query.term), function(results) {
          query.callback({
            results: filterStandardsByConfig(results)
          });
        });
      },

      initSelection: function(element, callback) {
        var val = this.getVal(element);
        var ids = val.split(',');
        var results = [];
        _.forEach(ids, function(id) {
          DataQueryService.findOne("standards", id, function success(item) {
            results.push(item);
            if (ids.length === results.length) {
              callback(results);
            }
          });
        });
      },

      formatSelection: function(standard) {
        setTimeout(function() {
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

    /**
     * The config contains an array of standards in dotNotation.
     * For each item we need to load the full standard object
     */
    function configToStandards(dotNotations, callback){
      if(!_.isArray(dotNotations) || 0 === dotNotations.length){
        return;
      }

      var results = [];
      _.forEach(dotNotations, function(dotNotation) {
          DataQueryService.query('standards', {searchTerm: dotNotation, fields: ['dotNotation']},
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

    $scope.$watch('profile.standards', function(newValue, oldValue) {
      $scope.isLiteracyStandardSelected = containsLiteracyStandard(newValue);
    });

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

      $scope.formModels.componentTypes.visible = 0 < $scope.componentTypes.length;
    }

    //----------------------------------------------------------------
    // subject and related subject
    //----------------------------------------------------------------

    function Select2Adapter(topic, formatFunc, formModel) {

      this.formatResult = formatFunc;
      this.formatSelection = formatFunc;

      function filterSubjectsByConfig(subjects){
        var options = formModel.options;
        if(!_.isArray(options)){
          return subjects;
        }
        return _.filter(subjects, function(item){
          return -1 !== _.indexOf(options, item.category + ":" + item.subject);
        });
      }

      this.query = function(query) {
        DataQueryService.query(topic,
          {searchTerm: query.term, fields:['subject']},
          function(result) {
            query.callback({
              results: filterSubjectsByConfig(result)
            });
          });
      };
    }

    function subjectText(s) {
      return s.category + ": " + s.subject;
    }

    $scope.primarySubjectSelect2Adapter = new Select2Adapter("subjects.primary", subjectText, $scope.formModels.primarySubject);
    $scope.relatedSubjectSelect2Adapter = new Select2Adapter("subjects.related", subjectText, $scope.formModels.relatedSubject);

    function findSubjectByCategorySubject(topic, categorySubject, callback){
      var parts = categorySubject.split(":");
      var category = parts[0];
      var subject = parts[1];
      DataQueryService.query(
        topic,
        {filters:[{field:'category', value:category},{field:'subject', value:subject}]},
        function(item) {
          callback(item[0]);
        });
    }

    /**
     * The config is a category:subject string.
     */
    function configToPrimarySubject(categorySubject, callback){
      $log.log("configToPrimarySubject", categorySubject);

      if(!_.isString(categorySubject)){
        return;
      }

      findSubjectByCategorySubject('subjects.primary', categorySubject, callback);
    }

    /**
     * The config is a list of category:subject strings.
     */
    function configToRelatedSubject(categorySubjectList, callback){
      $log.log("configToRelatedSubject", categorySubjectList);

      if(!_.isArray(categorySubjectList)){
        return;
      }

      var results = [];
      _.forEach(categorySubjectList, function(categorySubject){

        findSubjectByCategorySubject('subjects.related', categorySubject, function(result){
          results.push(result);
          if(results.length === categorySubjectList.length){
            callback(results);
          }
        });
      });
    }

    //----------------------------------------------------------------
    // some dataProviders for selects
    //----------------------------------------------------------------

    $scope.bloomsTaxonomyFilter = createOptionsFilter($scope.formModels.bloomsTaxonomy, 'key');

    DataQueryService.list("bloomsTaxonomy", function (result) {
      $scope.bloomsTaxonomyDataProvider = result;
    });

    $scope.depthOfKnowledgeFilter = createOptionsFilter($scope.formModels.depthOfKnowledge, 'key');

    DataQueryService.list("depthOfKnowledge", function (result) {
      $scope.depthOfKnowledgeDataProvider = result;
    });

    DataQueryService.list("gradeLevels", function (result) {
      $scope.gradeLevelDataProvider = result;
      $scope.gradeLevelFilter = createOptionsFilter($scope.formModels.gradeLevel, 'key');
      $scope.priorGradeLevelDataProvider = result;
      $scope.priorGradeLevelFilter = createOptionsFilter($scope.formModels.priorGradeLevel, 'key');
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
    function years(fromYear, toYear){
      var direction = fromYear > toYear ? -1 : 1;
      return _.range( fromYear, toYear + 1 * direction, direction).map(function(year){
        return year.toString();
      });
    }

    $scope.copyrightExpirationDateFilter = createOptionsFilter($scope.formModels.copyrightExpirationDate);

    $scope.copyrightExpirationDateDataProvider = years(new Date().getFullYear(), new Date().getFullYear() + 20).concat(['Never']);

    $scope.copyrightYearFilter = createOptionsFilter($scope.formModels.copyrightYear);

    $scope.copyrightYearDataProvider = years(new Date().getFullYear(), new Date().getFullYear() - 120);

    //----------------------------------------------------------------
    // credentials
    //----------------------------------------------------------------

    $scope.credentialsFilter = createOptionsFilter($scope.formModels.credentials, 'key');

    DataQueryService.list("credentials", function (result) {
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

    $scope.keySkillsFilter = function(item,index){
      return _.some(item.list, $scope.keySkillsSubListFilter);
    };

    $scope.keySkillsSubListFilter = function(item,index){
      return true;
    };

    $scope.keySkills = {
    };

    function getKeySkills(){
      var result = _.chain($scope.keySkills).values().flatten().value();
      return result;
    }

    function initKeySkillsSelection(){
      if($scope.otherAlignments && $scope.otherAlignments.keySkills && $scope.keySkillsDataProvider){
        _.forEach($scope.keySkillsDataProvider, function(categoryItem){
          var header = categoryItem.header;
          var keySkillsList = $scope.keySkills[header] = $scope.keySkills[header] || [];
          _.forEach(categoryItem.list, function(skill){
            if(_.contains($scope.otherAlignments.keySkills, skill)){
              if(!_.contains(keySkillsList,skill)){
                keySkillsList.push(skill);
              }
            }
          });
        });
      }
    }

    $scope.$watch('keySkills', function(newValue){
      if($scope.otherAlignments){
        $scope.otherAlignments.keySkills = getKeySkills();
        $scope.keySkillsTitle = "<span class='key-skills'>Key Skills <span class='badge'>" + $scope.otherAlignments.keySkills.length + "</span> <span class='selected'>selected.</span></span>";

      }
    }, true); //watch nested properties

    DataQueryService.list("keySkills", function (result) {
      $scope.keySkillsDataProvider = _.map(result, function (k) {
        return {
          header: k.key,
          list: k.value
        };
      });
      initKeySkillsSelection();
    });

    //----------------------------------------------------------------
    // prior use
    //----------------------------------------------------------------

    $scope.priorUseFilter = createOptionsFilter($scope.formModels.priorUse, 'key');

    $scope.$watch('profile.priorUse', function() {
      updatePriorUseOtherSelected();
    });

    DataQueryService.list("priorUses", function (result) {
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

    $scope.reviewsPassedFilter = createOptionsFilter($scope.formModels.reviewsPassed, 'key');

    DataQueryService.list("reviewsPassed", function (result) {
      $scope.reviewsPassedDataProvider = result;
      initReviewsPassedSelection();
      updateReviewsPassedOtherSelected();
    });

    function initReviewsPassedSelection() {
      if ($scope.reviewsPassedDataProvider && $scope.profile && _.isArray($scope.profile.reviewsPassed)) {

        _.each($scope.reviewsPassedDataProvider, function(item) {
          var selected = $scope.profile.reviewsPassed.indexOf(item.key) >= 0;
          if (selected !== item.selected) {
            item.selected = selected;
          }
        });
      }
    }

    function updateReviewsPassedOtherSelected() {
      var otherSelected = false;
      if ($scope.reviewsPassedDataProvider) {
        otherSelected = _.some($scope.reviewsPassedDataProvider, function(item) {
          return item.selected && 'Other' === item.key;
        });
      }
      if ($scope.isReviewsPassedOtherSelected && !otherSelected && $scope.profile) {
        $scope.profile.reviewsPassedOther = '';
      }
      $scope.isReviewsPassedOtherSelected = otherSelected;
    }

    $scope.onChangeReviewsPassed = function(changedKey) {
      function getKeys(predicate) {
        return _.chain($scope.reviewsPassedDataProvider)
          .filter(predicate)
          .pluck("key")
          .value();
      }

      var selectedKeys = getKeys(function(item) {
        return item.selected;
      });

      function keyIsSelected(key) {
        return selectedKeys.indexOf(key) >= 0;
      }

      if ("None"  === changedKey) {
        if (keyIsSelected(changedKey)) {
          selectedKeys = ["None"];
        }
      } else if ("All" === changedKey) {
        if (keyIsSelected(changedKey)) {
          var isOtherSelected = keyIsSelected("Other");
          selectedKeys = getKeys(function(item) {
            return "None" !== item.key && ("Other" !== item.key || isOtherSelected);
          });
        }
      } else {
        if (keyIsSelected(changedKey)) {
          selectedKeys = _.without(selectedKeys, "None");
        } else {
          selectedKeys = _.without(selectedKeys, "All");
        }
      }
      $scope.profile.reviewsPassed = selectedKeys;
      initReviewsPassedSelection();
    };

    $scope.$watch('profile.reviewsPassed', function() {
      updateReviewsPassedOtherSelected();
    });

    //----------------------------------------------------------------
    // show image for license type
    //----------------------------------------------------------------

    DataQueryService.list("licenseTypes", function(result) {
      $scope.licenseTypeDataProvider = result;
    });

    $scope.getLicenseTypeUrl = function(licenseType) {
      return licenseType ? "/assets/images/licenseTypes/" + licenseType.replace(" ", "-") + ".png" : undefined;
    };

    $scope.togglePreview = function() {
      $scope.previewOn = !$scope.previewOn;
    };

    //----------------------------------------------------------------
    // profile initialisation
    //----------------------------------------------------------------

    function setItem(item) {
      $log.log('setItem', item);
      $scope.item = item;

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

      overrideProfileValuesWithConfig(profile, $scope.formModels);

      $scope.taskInfo = profile.taskInfo;
      $scope.otherAlignments = profile.otherAlignments;
      $scope.contributorDetails = profile.contributorDetails;
      $scope.profile = profile;

      initComponentTypesUsed();
      initKeySkillsSelection();
      initReviewsPassedSelection();
      updateReviewsPassedOtherSelected();
      updatePriorUseOtherSelected();
      updateCredentialsOtherSelected();
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

    $scope.loadProfile = function(){
      $log.log("loading profile");
      ItemService.load(function(item){
        $log.log('item loading success hasItem:' + (!!item), item);
        if (item) {
          ConfigurationService.getConfig(function(config){
            $log.log('getConfig callback', config);
            updateFormModels(config.profileConfig);
            setItem(item);
          });
        } else {
          $log.error('error loading profile, item is null');
        }
      },function(err){
        $log.error('error loading profile', err);
      });
    };

    $scope.$watch('item.profile', throttle(function(oldValue, newValue){
      $scope.saveProfile();
    }), true); //watch nestedProperties

    $scope.saveProfile = function() {
      $log.log("saving profile");
      ItemService.fineGrainedSave({'profile': $scope.item.profile}, function(result){
        $log.log("profile saved result:", result);
      });
    };

    //----------------------------------------------------------------
    // startup
    //----------------------------------------------------------------

    $scope.loadProfile();

  }

})();
