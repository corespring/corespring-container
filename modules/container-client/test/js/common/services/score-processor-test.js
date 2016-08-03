/** This is a port of DefaultOutcomeProcessor.scala */
describe('score-processor', function() {

  corespring.bootstrap(angular);

  it('should process', function() {
    expect(true).toBe(true);

    var item = {
      components: {
        "3": {
          weight: 4
        }
      }
    };

    var responses = {
      "3": {
        score: 1.0
      }
    };

    var expected = {
      summary: {
        maxPoints: 4,
        points: 4.0,
        percentage: 100.0
      },
      components: {
        3: {
          weight: 4,
          score: 1.0,
          weightedScore: 4.0
        }
      }
    };

    var actual = corespring.scoreProcessor.score(item, {}, responses);
    expect(_.isEqual(actual, expected)).toBe(true);

  });

  it('should generate an score for two components', function() {
    var item = {
      components: {
        "3": {
          weight: 4
        },
        "4": {
          weight: 5
        }
      }
    };
    var responses = {
      "3": {
        score: 0.1
      },
      "4": {
        score: 0.6
      }
    };
    var expected = {
      summary: {
        maxPoints: 9,
        points: 3.4,
        percentage: 37.8
      },
      components: {
        "3": {
          weight: 4,
          score: 0.1,
          weightedScore: 0.4
        },
        "4": {
          weight: 5,
          score: 0.6,
          weightedScore: 3.0
        }
      }
    };

    var actual = corespring.scoreProcessor.score(item, {}, responses);
    expect(_.isEqual(actual, expected)).toBe(true);
  });

  it('should not score non-scoreable components', function() {
    corespring.server.logic = function(type) {
      return {
        isScoreable: function() {
          return type !== "line";
        }
      };
    };
    var item = {
      components: {
        "3": {
          componentType: "line",
          weight: 4
        },
        "4": {
          weight: 5
        }
      }
    };
    var responses = {
      "3": {
        score: 0.1
      },
      "4": {
        score: 0.6
      }
    };
    var expected = {
      summary: {
        maxPoints: 5,
        points: 3,
        percentage: 60
      },
      components: {
        "3": {
          weight: 0,
          score: 0.1,
          weightedScore: 0.0
        },
        "4": {
          weight: 5,
          score: 0.6,
          weightedScore: 3.0
        }
      }
    };
    var actual = corespring.scoreProcessor.score(item, {}, responses);
    expect(_.isEqual(actual, expected)).toBe(true);
  });

  describe('scoringType=allOrNothing', function() {
    it('should return 100 when percentage is 100', function() {
      var item = {
        config: {
          scoringType: "allOrNothing"
        },
        components: {
          "3": {
            weight: 4
          },
          "4": {
            weight: 5
          }
        }
      };
      var responses = {
        "3": {
          score: 1
        },
        "4": {
          score: 1
        }
      };
      var expected = {
        summary: {
          maxPoints: 9,
          points: 9,
          percentage: 100
        },
        components: {
          "3": {
            weight: 4,
            score: 1,
            weightedScore: 4
          },
          "4": {
            weight: 5,
            score: 1,
            weightedScore: 5
          }
        }
      };

      var actual = corespring.scoreProcessor.score(item, {}, responses);
      expect(_.isEqual(actual, expected)).toBe(true);
    });

    it('should return 0 when percentage is < 100', function() {
      var item = {
        config: {
          scoringType: "allOrNothing"
        },
        components: {
          "3": {
            weight: 4
          },
          "4": {
            weight: 5
          }
        }
      };
      var responses = {
        "3": {
          score: 0.5
        },
        "4": {
          score: 1
        }
      };
      var expected = {
        summary: {
          maxPoints: 9,
          points: 0,
          percentage: 0
        },
        components: {
          "3": {
            weight: 4,
            score: 0.5,
            weightedScore: 2
          },
          "4": {
            weight: 5,
            score: 1,
            weightedScore: 5
          }
        }
      };

      var actual = corespring.scoreProcessor.score(item, {}, responses);
      expect(actual).toEqual(expected);
      expect(_.isEqual(actual, expected)).toBe(true);
    });

  });
});