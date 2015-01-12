(function(root) {

  if (!root.corespring) {
    throw new Error("No corespring module defined on root");
  }

  var _ = root.corespring.require("lodash");

  var ScoreProcessor = function() {

    var weightForComponent = function(component) {
      var weight = _.isUndefined(component.weight) ? 1 : component.weight;
      var serverLogic = corespring.server.logic(component.componentType);
      if (_.isFunction(serverLogic.isScoreable)) {
        weight = serverLogic.isScoreable(component) ? weight : 0;
      }

      return weight;
    };

    this.isComponentScorable = function(component) {
      var serverLogic = corespring.server.logic(component.componentType);
      if (_.isFunction(serverLogic.isScoreable)) {
        return serverLogic.isScoreable(component);
      }
      return true;
    };

    this.score = function(item, session, responses) {

      var maxPoints = _.reduce(item.components, function(result, component, key) {
        var weight = weightForComponent(component);
        if (_.isUndefined(component.weight)) {
          console.warn("no weight specified for component", component);
        }
        var total = result + weight;
        return total;
      }, 0);

      var componentScores = _.chain(item.components).map(function(value, key) {
        return [key, scoreForComponent(value, responses[key])];
      }).zipObject().value();

      var points = _.reduce(componentScores, function(result, value, key) {
        return result + value.weightedScore;
      }, 0);

      var percentage = Math.round(points / maxPoints * 1000) / 10;

      return {
        summary: {
          maxPoints: maxPoints,
          points: points,
          percentage: percentage
        },
        components: componentScores
      };
    };

    var scoreForComponent = function(comp, response) {
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
    };
  };

  root.corespring.scoreProcessor = new ScoreProcessor();


})(this);