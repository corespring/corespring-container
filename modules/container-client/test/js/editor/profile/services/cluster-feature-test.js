describe('cluster feature', function() {

  var sut, scope;
  var mockDataQueryService;

  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editor.profile.services'));

  function MockDataQueryService() {
    this.listResult = [];

    this.list = function(topic, callback) {
      callback(_.cloneDeep(this.listResult));
    };
  }

  beforeEach(function() {
    mockDataQueryService = new MockDataQueryService();
    module(function($provide) {
      $provide.value('DataQueryService', mockDataQueryService);
    });
  });

  beforeEach(inject(function($rootScope, ClusterFeature) {
    sut = ClusterFeature;
    scope = $rootScope.$new();
    scope.profile = {
      taskInfo: {
        standardClusters: []
      }
    };
  }));

  function initClusterFeature() {
    sut.extendScope(scope);
  }

  function mkStandard(dotNotation, domain) {
    return {
      dotNotation: dotNotation,
      domain: domain
    };
  }

  function mkCluster(text, source, hidden) {
    return {
      text: text,
      source: source,
      hidden: hidden
    };
  }

  function mkClusterOption(subject, domain) {
    return {
      subject: subject,
      domain: domain
    };
  }

  function mkKeyId(value) {
    return {
      id: value,
      key: value
    };
  }

  describe('initialization', function() {
    it('should instantiate', function() {
      expect(sut).toBeTruthy();
    });
  });

  describe('auto tagging', function() {

    beforeEach(initClusterFeature);

    it('should add cluster for a standard', function() {
      scope.profile.standards = [mkStandard('A.B.C','some cluster text')];
      scope.$apply();
      expect(scope.profile.taskInfo.standardClusters).toEqual([
        mkCluster('some cluster text','A.B.C',false)]);
    });

    it('should remove cluster if related standard is removed from standards', function() {
      scope.profile.standards = [mkStandard('A.B.C','some cluster text')];
      scope.$apply();
      scope.profile.standards = [];
      scope.$apply();
      expect(scope.profile.taskInfo.standardClusters).toEqual([]);
    });
  });

  describe('manual clusters', function() {
    describe("clusterOptions", function() {

      beforeEach(function() {

        mockDataQueryService.listResult = [
          mkClusterOption('ELA','cluster-a'),
          mkClusterOption('ELA-Literacy','cluster-b'),
          mkClusterOption('Math','cluster-c'),
          mkClusterOption('Other','cluster-d')
          ];
        initClusterFeature();
      });

      describe("ela", function() {
        it("loads data", function() {
          expect(scope.elaClusterOptions).toEqual([mkKeyId('cluster-a'), mkKeyId('cluster-b')]);
        });
      });

      describe("math", function() {
        it("loads data", function() {
          expect(scope.mathClusterOptions).toEqual([mkKeyId('cluster-c')
            ]);
        });
      });
    });

    describe('selectedClusterFilter', function() {
      var cluster;
      var option;

      beforeEach(function() {
        cluster = mkCluster("some cluster", "A.B.C", false);
        option = mkKeyId("some cluster");
        initClusterFeature();
      });
      it('should return false if the cluster can be found in the profile', function() {
        scope.profile.taskInfo.standardClusters = [cluster];
        expect(scope.selectedClusterFilter(option)).toBe(false);
      });
      it('should return true if the cluster cannot be found in the profile', function() {
        scope.profile.taskInfo.standardClusters = [];
        expect(scope.selectedClusterFilter(option)).toBe(true);
      });
    });

    describe('additionalCluster', function() {
      beforeEach(initClusterFeature);
      it('setting it to a string should add a manual cluster to the profile ', function() {
        scope.additionalCluster = ['some cluster'];
        scope.$apply();
        expect(scope.profile.taskInfo.standardClusters).toEqual([
          mkCluster('some cluster','manual',false)]);
      });
    });
  });

});