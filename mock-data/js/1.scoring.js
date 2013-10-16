/**
 * Override the default scoring mechanism
 * @param answers - all the answers in an object keyed by their id
 * @returns {{score: number}} - a value between: 0.0 - 1.0
 */
exports.process = function(answers){
  var correctAnswers = 0;
  if (answers["3"].indexOf('3') != -1) correctAnswers += 1;
  if (answers["3"].indexOf('4') != -1) correctAnswers += 1;

  var score = 0;
  if (correctAnswers == 1) score = 0.5
  if (correctAnswers == 2) score = 1.0

  return {score : score};
}