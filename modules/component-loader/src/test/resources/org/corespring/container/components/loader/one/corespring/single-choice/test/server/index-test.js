server = require('../../src/server')
assert = require 'assert'
should = require 'should'
_ = require 'lodash'

component =
  componentType: "corespring-single-choice"
  model:
    prompt: "What is 1 + 1?"
    config:
      orientation: "vertical"
      shuffle: true
    choices: [
      { label : "1", value: "1" }
      { label : "2", value: "2"}
    ]
  correctResponse:
    value: "2"
  feedback: [
    { value: "1", feedback: "Huh?"}
    { value: "2", feedback: "Great", notChosenFeedback: "It was this one"}
  ]

answer = (value) -> {value: value}

settings = (feedback = true, userResponse = true, correctResponse = true) ->
  showUserResponse: userResponse
  showCorrectResponse: correctResponse
  showFeedback: feedback

describe 'single-choice server logic',  ->

  describe 'createOutcome', ->

    it 'should not show any feedback', ->
      response = server.createOutcome(_.cloneDeep(component), answer("2"), settings(false, true, true))
      expected =
        correctness: "correct"
      response.should.eql expected

    it 'should respond to a correct answer', ->
      response = server.createOutcome(_.cloneDeep(component), answer("2"), settings(true, true, true))
      expected =
        correctness: "correct"
        feedback: [
          { value: "2", feedback: "Great", correct : true}
        ]
      response.should.eql expected

    it 'should respond to an incorrect outcome (show correct too)', ->
      response = server.createOutcome(_.cloneDeep(component), answer("1"), settings(true, true, true))
      expected =
        correctness: "incorrect"
        feedback: [
          { value: "2", feedback: "It was this one", correct: true}
          { value: "1", feedback: "Huh?", correct: false}
        ]
      response.should.eql expected

    it 'should respond to an incorrect outcome (do not show correct)', ->
      response = server.createOutcome(_.cloneDeep(component), answer("1"), settings(true, true, false))
      expected =
        correctness: "incorrect"
        feedback: [
          { value: "1", feedback: "Huh?", correct: false}
        ]
      response.should.eql expected

