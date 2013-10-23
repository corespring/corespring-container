(function(root){

  if(!root.corespring){
    throw new Error("No corespring module defined on root");
  }

  var _ = root.corespring.require("lodash");

  var OutcomeProcessor = function(){

    this.outcome = function(item, session, responses){

      var maxPoints = _.reduce(item.components, function(result, value, key){
        var total = result + value.weight;
        return total;
      }, 0);

      var componentScores = _.chain(item.components).map(function(value, key){
        return [key, scoreForComponent(value, responses[key]) ];
      }).zipObject().value();

      var points = _.reduce(componentScores, function(result, value, key){
        return result + value.weightedScore;
      }, 0);

      var percentage = Math.round(points/maxPoints * 1000) / 10;

      return {
        summary : {
          maxPoints : maxPoints,
          points: points,
          percentage: percentage
        },
        components : componentScores
      };
    };

    var scoreForComponent = function(comp, response){
      return {
        weight : comp.weight,
        score: response.score,
        weightedScore: comp.weight * response.score
      };
    };
  };

  root.corespring.outcomeProcessor = new OutcomeProcessor();

})(this);