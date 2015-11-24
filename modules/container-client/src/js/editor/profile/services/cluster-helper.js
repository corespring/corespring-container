(function() {

  "use strict";

  angular.module('corespring-editor.profile.services')
    .service('ClusterHelper', [
      'LogFactory',
      ClusterHelper
    ]);

  function ClusterHelper(LogFactory) {

    var $log = LogFactory.getLogger('ClusterHelper');

    var MANUAL = 'manual';

    this.addManualCluster = addManualCluster;
    this.getClustersForUi = getClustersForUi;
    this.hideCluster = hideCluster;
    this.updateClustersFromStandards = updateClustersFromStandards;

    //--------------------------------------------

    function addManualCluster(clusters, text) {
      if (-1 === _.findIndex(clusters, {
          text: text,
          hidden: false
        })) {
        var cluster = mkCluster(text, MANUAL, false);
        clusters.push(cluster);
      }
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

  }

})();