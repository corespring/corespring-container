/**
 * Override the default scoring mechanism
 * @param answers - all the answers in an object keyed by their id
 * @returns {{score: number}} - a value between: 0.0 - 1.0
 * Available Globals: console, JSON, etc
 * Available Dependencies: "underscore"|"lodash"
 */
exports.process = function(item, answers){

  console.log("process item " + JSON.stringify(answers));
  var correctAnswers = 0;

  var answersThree = answers["3"];

  if(!answersThree){
    console.log("no answers for 3 - return 0");
    return summary(0.0);
  }

  if (answersThree.indexOf('3') != -1) correctAnswers += 1;
  if (answersThree.indexOf('4') != -1) correctAnswers += 1;

  var score = 0;
  if (correctAnswers == 1) score = 0.5
  if (correctAnswers == 2) score = 1.0

  return summary(score);
}

var summary = function(score){
  return {
    summary: {
      percentage : Math.min( 100, Math.round(score * 100)),
      note: "overriden score"
    }
  };
};