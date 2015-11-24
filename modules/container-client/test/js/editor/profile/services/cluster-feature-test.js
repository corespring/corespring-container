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
      standardClusters: []
    };
  }));

  function initClusterFeature() {
    sut.extendScope(scope);
  }

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
      expect(sut).toBeTruthy();
    });
  });

  describe('auto tagging', function() {

    beforeEach(initClusterFeature);

    it('should add cluster for a standard', function() {
      scope.profile.standards = [{
        cluster: 'some cluster text',
        dotNotation: 'A.B.C'
        }];
      scope.$apply();
      expect(scope.profile.standardClusters).toEqual([{
        text: 'some cluster text',
        source: 'A.B.C',
        hidden: false
        }]);
    });

    it('should remove cluster if related standard is removed from standards', function() {
      scope.profile.standards = [{
        cluster: 'some cluster text',
        dotNotation: 'A.B.C'
        }];
      scope.$apply();
      scope.profile.standards = [];
      scope.$apply();
      expect(scope.profile.standardClusters).toEqual([]);
    });
  });

  describe('manual clusters', function() {
    describe("clusterOptions", function() {

      beforeEach(function() {
        mockDataQueryService.listResult = [
          {
            subject: 'ELA',
            cluster: 'cluster-a'
            },
          {
            subject: 'ELA-Literacy',
            cluster: 'cluster-b'
            },
          {
            subject: 'Math',
            cluster: 'cluster-c'
            },
          {
            subject: 'Other',
            cluster: 'cluster-d'
            }
          ];
        initClusterFeature();
      });

      function keyId(value) {
        return {
          id: value,
          key: value
        };
      }

      describe("ela", function() {
        it("loads data", function() {
          expect(scope.elaClusterOptions).toEqual([keyId('cluster-a'), keyId('cluster-b')]);
        });
      });

      describe("math", function() {
        it("loads data", function() {
          expect(scope.mathClusterOptions).toEqual([keyId('cluster-c')
            ]);
        });
      });
    });

    describe('selectedClusterFilter', function() {
      var cluster;
      var option;

      beforeEach(function() {
        cluster = {
          text: "some cluster"
        };
        option = {
          key: "some cluster"
        };
        initClusterFeature();
      });
      it('should return false if the cluster can be found in the profile', function() {
        scope.profile.standardClusters = [cluster];
        expect(scope.selectedClusterFilter(option)).toBe(false);
      });
      it('should return true if the cluster cannot be found in the profile', function() {
        scope.profile.standardClusters = [];
        expect(scope.selectedClusterFilter(option)).toBe(true);
      });
    });

    describe('additionalCluster', function() {
      beforeEach(initClusterFeature);
      it('setting it to a string should add a manual cluster to the profile ', function() {
        scope.additionalCluster = ['some cluster'];
        scope.$apply();
        expect(scope.profile.standardClusters).toEqual([
          {
            text: 'some cluster',
            source: 'manual',
            hidden: false
            }
          ]);
      });
    });
  });

});