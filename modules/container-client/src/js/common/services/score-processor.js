(function(root) {

  if (!root.corespring) {
    throw new Error("No corespring module defined on root");
  }

  var _ = root.corespring.require("lodash");

  var ScoreProcessor = function() {

    this.score = function(item, session, responses) {

      var maxPoints = _.reduce(item.components, function(result, component, key) {
        var weight = weightForComponent(component);
        var total = result + weight;
        return total;
      }, 0);

      var componentScores = _.chain(item.components).map(function(value, key) {
        return [key, scoreForComponent(value, responses[key])];
      }).zipObject().value();

      var points = _.reduce(componentScores, function(result, value, key) {
        return result + (isNumber(value.weightedScore) ? value.weightedScore : 0 );
      }, 0);

      var percentage = Math.round(points / maxPoints * 1000) / 10;
      
      var scoringType = getScoringType(item);
      if(scoringType === 'allOrNothing'){
        if(percentage < 100){
          percentage = 0;
          points = 0;
        }
      }

      return {
        summary: {
          maxPoints: maxPoints,
          points: points,
          percentage: percentage
        },
        components: componentScores
      };
    };
    
    function getScoringType(item){
      switch(item.config ? item.config.scoringType : ''){
        case 'allOrNothing' : return 'allOrNothing';
        default: return 'weighted';
      }        
    }

    function weightForComponent(component) {
      var weight = 1;
      if (_.isUndefined(component.weight) || isNaN(component.weight)) {
        console.warn("no weight specified for component", component);
      } else {
        weight = component.weight;
      }
      var serverLogic = corespring.server.logic(component.componentType);
      if (_.isFunction(serverLogic.isScoreable) && !serverLogic.isScoreable(component)) {
        weight = 0;
      }
      return weight;
    }

    function scoreForComponent(comp, response) {
      if (!response) {
        return {
          weight: 0,
          score: 0,
          weightedScore: 0
        };
      }

      var weight = weightForComponent(comp);

      if (!comp.weight) {
        console.warn("no weight for comp", comp);
      }

      return {
        weight: weight,
        score: response.score,
        weightedScore: weight * response.score
      };
    }

    function isNumber(x){
      return !_.isNaN(x) && _.isNumber(x);
    }


  };

  root.corespring.scoreProcessor = new ScoreProcessor();


})(this);