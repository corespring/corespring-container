describe('cluster helper', function() {

  var sut;

  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editor.profile.services'));

  beforeEach(function() {
    module(function($provide) {

    });
  });

  beforeEach(inject(function(ClusterHelper) {
    sut = ClusterHelper;
  }));

  function mkStandard(dotNotation, cluster) {
    return {
      dotNotation: dotNotation,
      cluster: cluster
    };
  }

  function mkCluster(text, source, hidden) {
    return {
      text: text,
      source: source,
      hidden: hidden
    };
  }

  describe('initialization', function() {
    it('should instantiate', function() {
      expect(sut).not.toBe(null);
    });
  });

  describe('updateClusters', function() {
    var clusters;
    beforeEach(function() {
      clusters = [];
    });
    it('should add a cluster', function() {
      sut.updateClusters(clusters, [mkStandard('A.B.C', 'some cluster')]);
      expect(clusters).toEqual([mkCluster('some cluster', 'A.B.C', false)]);
    });
    it('should add a cluster twice', function() {
      sut.updateClusters(clusters, [
          mkStandard('A.B.C', 'some cluster'),
          mkStandard('D.E.F', 'some cluster')]);
      expect(clusters).toEqual([
          mkCluster('some cluster', 'A.B.C', false),
          mkCluster('some cluster', 'D.E.F', false)
        ]);
    });
    it('should add a new cluster as visible, if same clusters are hidden', function() {
      sut.updateClusters(clusters, [mkStandard('A.B.C', 'some cluster')]);
      sut.hideCluster(clusters, mkCluster('some cluster', 'A.B.C', false));
      sut.updateClusters(clusters, [mkStandard('A.B.C', 'some cluster'), mkStandard('D.E.F', 'some cluster')]);
      expect(clusters).toEqual([
          mkCluster('some cluster', 'A.B.C', true),
          mkCluster('some cluster', 'D.E.F', false)
        ]);
    });
    it('should remove a cluster when the related standard is removed', function() {
      sut.updateClusters(clusters, [mkStandard('A.B.C', 'some cluster')]);
      sut.updateClusters(clusters, []);
      expect(clusters).toEqual([]);
    });
  });
  describe('hideCluster', function() {
    var clusters;
    beforeEach(function() {
      clusters = [];
    });
    it('should hide a cluster', function() {
      sut.updateClusters(clusters, [mkStandard('A.B.C', 'some cluster')]);
      sut.hideCluster(clusters, mkCluster('some cluster', 'A.B.C', false));
      expect(clusters).toEqual([mkCluster('some cluster', 'A.B.C', true)]);
    });
    it('should hide all clusters with same text', function() {
      sut.updateClusters(clusters, [
          mkStandard('A.B.C', 'some cluster'),
          mkStandard('D.E.F', 'some cluster'),
        ]);
      sut.hideCluster(clusters, mkCluster('some cluster', 'A.B.C', false));
      expect(clusters).toEqual([
          mkCluster('some cluster', 'A.B.C', true),
          mkCluster('some cluster', 'D.E.F', true)
        ]);
    });
  });

  describe('getClustersForUi', function() {
    var clusters;
    beforeEach(function() {
      clusters = [];
    });
    it('should only return visible clusters', function() {
      sut.updateClusters(clusters, [mkStandard('A.B.C', 'some cluster')]);
      sut.hideCluster(clusters, mkCluster('some cluster', 'A.B.C', false));
      sut.updateClusters(clusters, [mkStandard('A.B.C', 'some cluster'), mkStandard('D.E.F', 'that cluster')]);
      expect(sut.getClustersForUi(clusters)).toEqual([mkCluster('that cluster', 'D.E.F', false)]);
    });

    it('should return a unique list of clusters', function() {
      sut.updateClusters(clusters, [
        mkStandard('A.B.C', 'this cluster'),
        mkStandard('D.E.F', 'this cluster')]);
      expect(sut.getClustersForUi(clusters)).toEqual([mkCluster('this cluster', 'A.B.C', false)]);
    });
  });

});