(function() {

  "use strict";

  /**
   * Scope extension to handle clusters
   */
  angular.module('corespring-editor.profile.services')
    .service('ClusterFeature', [
      'DataQueryService',
      'LogFactory',
      ClusterFeature
    ]);

  function ClusterFeature(DataQueryService, LogFactory) {

    var $log = LogFactory.getLogger('ClusterFeature');

    var MANUAL = 'manual';

    this.extendScope = extendScope;

    //--------------------------------------------

    function extendScope(scope) {
      //select2 model for manually selected clusters
      scope.additionalCluster = [];
      //the list of clusters shown in the ui
      scope.clusters = [];
      //the options for selecting cluster manually
      scope.elaClusterOptions = [];
      scope.mathClusterOptions = [];
      //ths filter for the cluster selector removes clusters that are selected already
      scope.selectedClusterFilter = selectedClusterFilter;

      //fires when the user clicks an x button to remove a cluster
      scope.$watchCollection('clusters', hideClusterInProfile);

      //fires when the user selects an additional cluster
      scope.$watch('additionalCluster', addClusterToProfile);

      //fires when the standards change in the profile
      scope.$watchCollection('profile.standards', updateClusters);

      DataQueryService.list("standardClusters", setupAdditionalClusterOptions);

      //----------------------------------------------

      function setupAdditionalClusterOptions(result) {
        scope.mathClusterOptions = getClusterOptions(result, /Math/i);
        scope.elaClusterOptions = getClusterOptions(result, /(ELA|ELA-Literacy)/i);
      }

      function updateClusters() {
        updateClustersFromStandards(scope.profile.standardClusters, scope.profile.standards);
        scope.clusters = addIdForSelect2(getClustersForUi(scope.profile.standardClusters));
      }

      function hideClusterInProfile(newValue, oldValue) {
        if (_.isArray(newValue) && _.isArray(oldValue)) {
          if (newValue.length < oldValue.length) {
            var dif = _.difference(oldValue, newValue);
            hideCluster(scope.profile.standardClusters, dif.pop());
          }
        }
      }

      function addClusterToProfile(newValue, oldValue) {
        if (_.isArray(newValue) && newValue.length > 0) {
          var cluster = newValue.pop();
          if (!_.isEmpty(cluster)) {
            addManualCluster(scope.profile.standardClusters, cluster);
            updateClusters();
          }
          scope.additionalCluster = [];
        }
      }

      function selectedClusterFilter(option, index) {
        return scope.profile &&
          scope.profile.standardClusters &&
          -1 === _.findIndex(scope.profile.standardClusters, {
            text: option.key
          });
      }
    }

    function addManualCluster(clusters, text) {
      if (-1 === _.findIndex(clusters, {
          text: text,
          hidden: false
        })) {
        var cluster = mkCluster(text, MANUAL, false);
        clusters.push(cluster);
      }
    }

    function addIdForSelect2(clusters) {
      //select2 expects an id, otherwise it doesn't display more than one item
      return _.map(clusters, function(c) {
        return {
          id: _.uniqueId(),
          text: c.text,
          source: c.source
        };
      });
    }

    function getClustersForUi(clusters) {
      return _(clusters)
        .uniq('text')
        .filter(function(c) {
          return !c.hidden;
        })
        .sortBy('text')
        .value();
    }

    function hideCluster(clusters, cluster) {
      _.forEach(clusters, function(c) {
        if (cluster.text === c.text) {
          c.hidden = true;
        }
      });
      _.remove(clusters, function(c) {
        return c.hidden && c.source === MANUAL;
      });
    }

    function updateClustersFromStandards(clusters, standards) {
      removeClustersWithoutStandard();
      addClustersForNewStandards();

      function removeClustersWithoutStandard() {
        _.remove(clusters, function(c) {
          return c.source !== MANUAL &&
            -1 === _.findIndex(standards, {
              dotNotation: c.source
            });
        });
      }

      function addClustersForNewStandards() {
        _.forEach(standards, function(s) {
          if (-1 === _.findIndex(clusters, {
              source: s.dotNotation
            })) {
            clusters.push(mkCluster(s.cluster, s.dotNotation, false));
          }
        });
      }
    }

    /**
     * @param text the label shown in the ui
     * @param source dotNotation of the source standard or "manual"
     * @param hidden true, if the cluster has been hidden by the user
     * @returns {{text: *, source: (string|string|string), hidden: boolean}}
     */
    function mkCluster(text, source, hidden) {
      return {
        text: text,
        source: source,
        hidden: false
      };
    }

    function getClusterOptions(results, groupRegExp) {
      return _(results)
        .filter(function(c) {
          return groupRegExp.test(c.subject);
        })
        .sortBy("cluster")
        .map(function(groupAndCluster) {
          return {
            id: groupAndCluster.cluster,
            key: groupAndCluster.cluster
          };
        })
        .value();
    }
  }

})();