package org.corespring.shell.controllers.data

import play.api.libs.json.{ Json, JsValue }

object FieldValueJson {

  def apply(): JsValue = fieldValues

  var depthOfKnowledge = Json.parse(
    """[
      |{"key":"1","value":"Recall & Reproduction"},
      |{"key":"3","value":"Strategic Thinking & Reasoning"},
      |{"key":"2","value":"Skills & Concepts"},
      |{"key":"4","value":"Extended Thinking"},
      |{"key":"None","value":"None"}]""".stripMargin)
  val fieldValues = Json.obj(
    "version" -> "0.0.3",
    "mediaType" -> Json.arr(
      Json.obj(
        "key" -> "Audio",
        "value" -> "Audio"),
      Json.obj(
        "key" -> "Image",
        "value" -> "Image"),
      Json.obj(
        "key" -> "Passage",
        "value" -> "Passage"),
      Json.obj(
        "key" -> "Video",
        "value" -> "Video")),
    "bloomsTaxonomy" -> Json.arr(
      Json.obj(
        "key" -> "Remembering",
        "value" -> "Remembering"),
      Json.obj(
        "key" -> "Understanding",
        "value" -> "Understanding"),
      Json.obj(
        "key" -> "Applying",
        "value" -> "Applying"),
      Json.obj(
        "key" -> "Analyzing",
        "value" -> "Analyzing"),
      Json.obj(
        "key" -> "Evaluating",
        "value" -> "Evaluating"),
      Json.obj(
        "key" -> "Creating",
        "value" -> "Creating")),
    "depthOfKnowledge" -> depthOfKnowledge,
    "demonstratedKnowledge" -> Json.arr(
      Json.obj(
        "key" -> "Factual",
        "value" -> "Factual"),
      Json.obj(
        "key" -> "Conceptual",
        "value" -> "Conceptual"),
      Json.obj(
        "key" -> "Procedural",
        "value" -> "Procedural"),
      Json.obj(
        "key" -> "Metacognitive",
        "value" -> "Metacognitive")),
    "priorUses" -> Json.arr(
      Json.obj(
        "key" -> "Formative",
        "value" -> "Formative"),
      Json.obj(
        "key" -> "Interim",
        "value" -> "Interim"),
      Json.obj(
        "key" -> "Benchmark",
        "value" -> "Benchmark"),
      Json.obj(
        "key" -> "Summative",
        "value" -> "Summative"),
      Json.obj(
        "key" -> "International Benchmark",
        "value" -> "International Benchmark"),
      Json.obj(
        "key" -> "Other",
        "value" -> "Other")),
    "credentials" -> Json.arr(
      Json.obj(
        "key" -> "Application Developer",
        "value" -> "Application Developer"),
      Json.obj(
        "key" -> "Assessment Developer Test Item Writer",
        "value" -> "Assessment Developer Test Item Writer"),
      Json.obj(
        "key" -> "Curriculum Developer",
        "value" -> "Curriculum Developer"),
      Json.obj(
        "key" -> "District Item Writer",
        "value" -> "District Item Writer"),
      Json.obj(
        "key" -> "Game Designer",
        "value" -> "Game Designer"),
      Json.obj(
        "key" -> "Non-Profit",
        "value" -> "Non-Profit"),
      Json.obj(
        "key" -> "Professional Developer",
        "value" -> "Professional Developer"),
      Json.obj(
        "key" -> "State Department of Education Item Writer",
        "value" -> "State Department of Education Item Writer"),
      Json.obj(
        "key" -> "Student",
        "value" -> "Student"),
      Json.obj(
        "key" -> "Teacher",
        "value" -> "Teacher"),
      Json.obj(
        "key" -> "Other",
        "value" -> "Other")),
    "licenseTypes" -> Json.arr(
      Json.obj(
        "key" -> "CC BY",
        "value" -> "CC BY"),
      Json.obj(
        "key" -> "CC BY-SA",
        "value" -> "CC BY-SA"),
      Json.obj(
        "key" -> "CC BY-NC",
        "value" -> "CC BY-NC"),
      Json.obj(
        "key" -> "CC BY-ND",
        "value" -> "CC BY-ND"),
      Json.obj(
        "key" -> "CC BY-NC-SA",
        "value" -> "CC BY-NC-SA"),
      Json.obj(
        "key" -> "Other",
        "value" -> "Other")),
    "itemTypes" -> Json.arr(
      Json.obj(
        "key" -> "Fixed Choice",
        "value" -> Json.arr(
          "Multiple Choice",
          "Multi-Multi Choice",
          "Visual Multi Choice",
          "Inline Choice",
          "Ordering",
          "Drag & Drop")),
      Json.obj(
        "key" -> "Constructed Response",
        "value" -> Json.arr(
          "Constructed Response - Short Answer",
          "Constructed Response - Open Ended")),
      Json.obj(
        "key" -> "Evidence",
        "value" -> Json.arr(
          "Select Evidence in Text",
          "Document Based Question",
          "Passage With Questions")),
      Json.obj(
        "key" -> "Composite",
        "value" -> Json.arr(
          "Composite - Multiple MC",
          "Composite - MC and SA",
          "Composite - MC, SA, OE",
          "Composite - Project",
          "Composite - Performance",
          "Composite - Activity",
          "Composite - Algebra")),
      Json.obj(
        "key" -> "Algebra",
        "value" -> Json.arr(
          "Plot Lines",
          "Plot Points",
          "Evaluate an Equation"))),
    "gradeLevels" -> Json.arr(
      Json.obj(
        "key" -> "PK",
        "value" -> "Prekindergarten"),
      Json.obj(
        "key" -> "KG",
        "value" -> "Kindergarten"),
      Json.obj(
        "key" -> "01",
        "value" -> "First grade"),
      Json.obj(
        "key" -> "02",
        "value" -> "Second grade"),
      Json.obj(
        "key" -> "03",
        "value" -> "Third grade"),
      Json.obj(
        "key" -> "04",
        "value" -> "Fourth grade"),
      Json.obj(
        "key" -> "05",
        "value" -> "Fifth grade"),
      Json.obj(
        "key" -> "06",
        "value" -> "Sixth grade"),
      Json.obj(
        "key" -> "07",
        "value" -> "Seventh grade"),
      Json.obj(
        "key" -> "08",
        "value" -> "Eighth grade"),
      Json.obj(
        "key" -> "09",
        "value" -> "Ninth grade"),
      Json.obj(
        "key" -> "10",
        "value" -> "Tenth grade"),
      Json.obj(
        "key" -> "11",
        "value" -> "Eleventh grade"),
      Json.obj(
        "key" -> "12",
        "value" -> "Twelfth grade"),
      Json.obj(
        "key" -> "13",
        "value" -> "Grade 13"),
      Json.obj(
        "key" -> "PS",
        "value" -> "Postsecondary"),
      Json.obj(
        "key" -> "AP",
        "value" -> "Advanced Placement"),
      Json.obj(
        "key" -> "UG",
        "value" -> "Ungraded")),
    "reviewsPassed" -> Json.arr(
      Json.obj(
        "key" -> "Editorial",
        "value" -> "Editorial"),
      Json.obj(
        "key" -> "Bias",
        "value" -> "Bias"),
      Json.obj(
        "key" -> "Fairness",
        "value" -> "Fairness"),
      Json.obj(
        "key" -> "Content",
        "value" -> "Content"),
      Json.obj(
        "key" -> "Psychometric",
        "value" -> "Psychometric"),
      Json.obj(
        "key" -> "All",
        "value" -> "All"),
      Json.obj(
        "key" -> "None",
        "value" -> "None"),
      Json.obj(
        "key" -> "Other",
        "value" -> "Other")),
    "keySkills" -> Json.arr(
      Json.obj(
        "key" -> "Knowledge",
        "value" -> Json.arr(
          "Arrange",
          "Define",
          "Describe",
          "Duplicate",
          "Identify",
          "Label",
          "List",
          "Match",
          "Memorize",
          "Name",
          "Order",
          "Outline",
          "Recall",
          "Recognize",
          "Relate",
          "Repeat",
          "Reproduce",
          "Select",
          "State")),
      Json.obj(
        "key" -> "Understand",
        "value" -> Json.arr(
          "Classify",
          "Convert",
          "Defend",
          "Discuss",
          "Distinguish",
          "Estimate",
          "Example(s)",
          "Explain",
          "Express",
          "Extend",
          "Generalize",
          "Give",
          "Indicate",
          "Infer",
          "Locate",
          "Paraphrase",
          "Predict",
          "Review",
          "Rewrite",
          "Summarize",
          "Translate",
          "Understand")),
      Json.obj(
        "key" -> "Apply",
        "value" -> Json.arr(
          "Apply",
          "Change",
          "Choose",
          "Compute",
          "Demonstrate",
          "Discover",
          "Dramatize",
          "Employ",
          "Illustrate",
          "Interpret",
          "Manipulate",
          "Modify",
          "Operate",
          "Practice",
          "Prepare",
          "Produce",
          "Schedule",
          "Show",
          "Sketch",
          "Solve",
          "Use",
          "Write")),
      Json.obj(
        "key" -> "Analyze",
        "value" -> Json.arr(
          "Analyze",
          "Appraise",
          "Breakdown",
          "Calculate",
          "Categorize",
          "Compare",
          "Contrast",
          "Criticize",
          "Diagram",
          "Differentiate",
          "Discriminate",
          "Examine",
          "Experiment",
          "Infer",
          "Model",
          "Point-Out",
          "Question",
          "Separate",
          "Test")),
      Json.obj(
        "key" -> "Evaluate",
        "value" -> Json.arr(
          "Assemble",
          "Collect",
          "Combine",
          "Comply",
          "Devise",
          "Evaluate",
          "Explain",
          "Formulate",
          "Generate",
          "Plan",
          "Rearrange")),
      Json.obj(
        "key" -> "Create",
        "value" -> Json.arr(
          "Compose",
          "Construct",
          "Create",
          "Design",
          "Develop"))))
}
