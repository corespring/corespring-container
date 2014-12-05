(function() {

  angular.module('corespring-editor.controllers')
    .controller('ProfileController', [
      '$location',
      '$scope',
      'throttle',
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
    DataQueryService,
    DesignerService,
    ItemService,
    LogFactory,
    ProfileFormatter,
    StandardQueryCreator) {

    var $log = LogFactory.getLogger('ProfileController');

    //----------------------------------------------------------------
    // Form configuration
    // The form can be configured by passing the json encoded
    // configuration as config={"title":{"value":"some title", "readonly":false, "visible":true}}
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
      priorUse: {
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
      //--------------------
      author: {
        visible:true,
        readonly:false
      },
      credentials: {
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
    function updateFormModels(formModels, config){
      if(!config){
        return;
      }
      for(var key in formModels){
        $log.log("updateFormModels", [key, formModels[key], config[key]]);
        updateFormModel(formModels[key], config[key]);
      }
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

    updateFormModels($scope.formModels, getFormConfigFromUrl());


    /**
     * Once the profile is loaded, we can use the formModels
     * to update the profile with the configured values
     * @param profile
     * @param config
     */
    function overrideProfileValuesWithConfig(profile, config){

      function assign(dest, name, sourceName){
        var source = config[sourceName || name];
        if(source && source.hasOwnProperty('value')){
          dest[name] = source.value;
        }
      }

      assign(profile.taskInfo, "title");
      assign(profile.taskInfo, "description");
      assign(profile.taskInfo.subjects, "primary", "primarySubject");
      assign(profile.taskInfo.subjects, "related", "relatedSubject");
      assign(profile.taskInfo, "gradeLevel");

      assign(profile, "standards");
      assign(profile, "lexile");

      assign(profile.otherAlignments, "depthOfKnowledge");
      assign(profile.otherAlignments, "bloomsTaxonomy");
      assign(profile.otherAlignments, "keySkills");

      assign(profile, "priorUse");
      assign(profile, "priorGradeLevel");
      assign(profile, "reviewsPassed");

      assign(profile.contributorDetails, "author");
      assign(profile.contributorDetails, "credentials");
      assign(profile.contributorDetails, "copyrightOwner");
      assign(profile.contributorDetails, "copyrightYear");
      assign(profile.contributorDetails, "copyrightExpirationDate");
      assign(profile.contributorDetails, "sourceUrl");

      assign(profile.contributorDetails, "additionalCopyrights");

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

    function createStandardQuery(searchText) {
      return JSON.stringify(
        StandardQueryCreator.createStandardQuery(
          searchText,
          $scope.standardsAdapter.subjectOption,
          $scope.standardsAdapter.categoryOption,
          $scope.standardsAdapter.subCategoryOption));
    }

    $scope.standardsAdapter = {
      subjectOption: {},
      categoryOption: {},
      subCategoryOption: {},
      tags: [],
      allowClear: true,
      minimumInputLength: 1,
      placeholder: "Begin by typing a standard or skill.",

      id: function(item) {
        return item.id;
      },

      getVal: function(element){
        return $(element).val();
      },

      query: function(query) {
        DataQueryService.query("standards", createStandardQuery(query.term), function(results) {
          query.callback({
            results: results
          });
        });
      },

      initSelection: function(element, callback) {
        var val = this.getVal(element);
        $log.warn("standards initSelection val", val);
        var ids = val.split(',');
        var results = [];
        ids.forEach(function(id) {
          findItemById("standards", id, function(item) {
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

    function containsLiteracyStandard(standards) {
      return null != _.find(standards, function(item) {
        return item && item.subject && item.subject.toLowerCase().indexOf("literacy") >= 0;
      });
    }

    $scope.$watch('profile.standards', function(newValue, oldValue) {
      $log.log("profile.standards", newValue);

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

    $scope.queryResults = {};

    /**
     * Return data from DataQueryService or local cache
     * @param topic
     * @param id
     * @param callback
     */
    function findItemById(topic, id, callback) {

      var local = _.find($scope.queryResults[topic], function(r) {
        return id === r.id;
      });
      if (local) {
        callback(local);
      } else {
        DataQueryService.findOne(topic, id, function success(data) {
          callback(data);
        });
      }
    }

    function queryAndCache(topic, query){
      DataQueryService.query(topic, query.term, function(result) {
        $scope.queryResults[topic] = result;
        query.callback({
          results: result
        });
      });
    }

    function Select2Adapter(topic, formatFunc, properties) {

      var that = this;

      _.assign(this, properties);

      this.formatResult = formatFunc;
      this.formatSelection = formatFunc;

      this.elementToVal = function(element) {
        return $(element).select2('val');
      };

      this.query = function(query) {
        $log.log("query", query);
        queryAndCache(topic, query);
      };

      this.initSelection = function(element, callback) {
        $log.log("init selection:", element, callback);
        var val = that.elementToVal(element);
        $log.log("val:", val);

        findItemById(topic, val, callback);
      };
    }

    function subjectText(s) {
      return s.category + ": " + s.subject;
    }

    $scope.primarySubjectSelect2Adapter = new Select2Adapter("subjects.primary", subjectText);
    $scope.relatedSubjectSelect2Adapter = new Select2Adapter("subjects.related", subjectText);

    //----------------------------------------------------------------
    // some dataProviders for selects
    //----------------------------------------------------------------

    DataQueryService.list("mediaType", function(result) {
      $scope.mediaTypeDataProvider = result; //not configurable, so no applyConfig here
    });

    DataQueryService.list("bloomsTaxonomy", function(result) {
      $scope.bloomsTaxonomyDataProvider = applyConfig(result,$scope.formModels.bloomsTaxonomy);
    });

    DataQueryService.list("depthOfKnowledge", function(result) {
      $scope.depthOfKnowledgeDataProvider = applyConfig(result, $scope.formModels.depthOfKnowledge);
    });

    DataQueryService.list("gradeLevels", function(result) {
      function showKeyInsteadOfValue(result) {
        return _.map(result, function (item) {
          item.value = item.key;
          return item;
        });
      }
      result = showKeyInsteadOfValue(result);
      $scope.gradeLevelDataProvider = applyConfig(result, $scope.formModels.gradeLevel);
      $scope.priorGradeLevelDataProvider = applyConfig(result, $scope.formModels.priorGradeLevel);
    });



    function applyConfig(data, config){
      if(!_.isArray(config.options)) {
        return data;
      }

      function itemIsInOptions(item){
        //most items are key-value objects
        //but some items like the copyright year are simple values
        var key = item && item.hasOwnProperty('key') ? item.key : item;
        return -1 < _.findIndex(config.options, function (option) {
            return key === option;
          });
      }
      return _.filter(data, itemIsInOptions);
    }

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

    $scope.copyrightExpirationDateDataProvider = applyConfig(
      years(new Date().getFullYear(), new Date().getFullYear() + 20).concat(['Never']),
      $scope.formModels.copyrightExpirationDate);

    $scope.copyrightYearDataProvider = applyConfig(
      years(new Date().getFullYear(), new Date().getFullYear() - 120),
      $scope.formModels.copyrightYear);

    //----------------------------------------------------------------
    // credentials
    //----------------------------------------------------------------

    DataQueryService.list("credentials", function(result) {
      $scope.credentialsDataProvider = applyConfig(result, $scope.formModels.credentials);
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

    DataQueryService.list("keySkills", function(result) {
      $scope.keySkillsDataProvider = _.map(result, function(k) {
        return {
          header: k.key,
          list: k.value
        };
      });
    });

    $scope.getKeySkillsSummary = function(keySkills) {
      var count = "No";
      var skills = "Skills";

      if (keySkills) {

        if (0 < keySkills.length) {
          count = keySkills.length;
        }

        if (1 === keySkills.length) {
          skills = "Skill";
        }
      }
      return count + " Key " + skills + " selected";
    };

    //----------------------------------------------------------------
    // prior use
    //----------------------------------------------------------------

    DataQueryService.list("priorUses", function(result) {
      $scope.priorUseDataProvider = applyConfig(result,$scope.formModels.priorUse);
      updatePriorUseOtherSelected();
    });

    $scope.$watch('profile.priorUse', function() {
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

    DataQueryService.list("reviewsPassed", function(result) {
      $scope.reviewsPassedDataProvider = applyConfig(result,$scope.formModels.reviewsPassed);
      initReviewsPassedDataProvider();
      updateReviewsPassedOtherSelected();
    });

    function initReviewsPassedDataProvider() {
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
      initReviewsPassedDataProvider();
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
      var profile = item.profile;

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

      if (!_.isArray(contributorDetails.additionalCopyrights)) {
        contributorDetails.additionalCopyrights = [];
      } else {
        removeEmptyAdditionalCopyrightItems(contributorDetails.additionalCopyrights);
      }

      overrideProfileValuesWithConfig(profile, $scope.formModels);

      $scope.taskInfo = profile.taskInfo;
      $scope.otherAlignments = profile.otherAlignments;
      $scope.contributorDetails = profile.contributorDetails;
      $scope.profile = profile;
      $scope.item = item;

      $log.log("task info:", $scope.taskInfo);
      $log.log("other alignments:", $scope.otherAlignments);
      $log.log("contributor details:", $scope.contributorDetails);

      initComponentTypesUsed();
      initReviewsPassedDataProvider();
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
        $log.warn('item loading success hasItem:' + (!!item) + " hasProfile:" + (!!item && !!item.profile), item);
        if (item && item.profile) {

          setItem(item);

          var watchNestedProperties;
          $scope.$watch('item.profile', throttle(function(oldValue, newValue){
            $scope.saveProfile();
          }), watchNestedProperties = true);
        }
      },function(){
        $log.error('error loading profile');
      });
    };

    $scope.saveProfile = function() {
      $log.log("saving profile");
      ItemService.fineGrainedSave({'profile': $scope.item.profile}, function(result){
        $log.log("profile saved result:", result);
      });
    };

    $scope.$on('getEditorOptionsResult', function(evt, data){
      $log.warn('getEditorOptionsResult', data);
      if(data) {
        updateFormModels($scope.formModels, data.profileConfig);
      }
    });

    $scope.$emit("getEditorOptions");
    $scope.loadProfile();
  }

})();
