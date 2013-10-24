/** This is a port of DefaultOutcomeProcessor.scala */
describe('outcome-processor', function(){

  corespring.bootstrap(angular);

  it('should process', function(){
    expect(true).toBe(true);

    var item = {components: {"3" : {weight: 4 } } };

    var responses = {"3" : {score: 1.0 } };

    var expected = {
      summary : {maxPoints : 4, points : 4.0, percentage : 100.0 },
      components : {3 : {weight : 4, score : 1.0, weightedScore : 4.0 } }
    };

    var actual = corespring.outcomeProcessor.outcome(item, {}, responses);
    expect(_.isEqual(actual, expected)).toBe(true);

  });

  it('should generate an outcome for two components', function(){
    var item = {components: {"3" : {weight:4}, "4" : {weight:5} } };
    var responses = {"3" : {score:0.1}, "4" : {score:0.6} };
    var expected = {
      summary : { maxPoints : 9, points : 3.4, percentage : 37.8 },
      components : {
        "3" : { weight : 4, score : 0.1, weightedScore : 0.4},
        "4" : { weight : 5, score : 0.6, weightedScore : 3.0}
      }
    };

    var actual = corespring.outcomeProcessor.outcome(item, {}, responses);
    expect(_.isEqual(actual, expected)).toBe(true);
  });
});