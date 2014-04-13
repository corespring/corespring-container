package org.corespring.shell.controllers

import play.api.libs.json.{ Json, JsValue }

object FieldValueJson {

  val jsonString =
    """
      |{
      |    "version" : "0.0.2",
      |    "bloomsTaxonomy" : [
      |        {
      |            "key" : "Remembering",
      |            "value" : "Remembering"
      |        },
      |        {
      |            "key" : "Understanding",
      |            "value" : "Understanding"
      |        },
      |        {
      |            "key" : "Applying",
      |            "value" : "Applying"
      |        },
      |        {
      |            "key" : "Analyzing",
      |            "value" : "Analyzing"
      |        },
      |        {
      |            "key" : "Evaluating",
      |            "value" : "Evaluating"
      |        },
      |        {
      |            "key" : "Creating",
      |            "value" : "Creating"
      |        }
      |    ],
      |    ,
      |    "depthOfKnowledge" : [
      |        {
      |            "key" : "1 Recall & Reproduction",
      |            "value" : "1 Recall & Reproduction"
      |        },
      |        {
      |            "key" : "2 Skills & Concepts",
      |            "value" : "2 Skills & Concepts"
      |        },
      |        {
      |            "key" : "3 Strategic Thinking/Reasoning",
      |            "value" : "3 Strategic Thinking/Reasoning"
      |        },
      |        {
      |            "key" : "4 Extended Thinking",
      |            "value" : "4 Extended Thinking"
      |        }
      |    ],
      |    "demonstratedKnowledge" : [
      |        {
      |            "key" : "Factual",
      |            "value" : "Factual"
      |        },
      |        {
      |            "key" : "Conceptual",
      |            "value" : "Conceptual"
      |        },
      |        {
      |            "key" : "Procedural",
      |            "value" : "Procedural"
      |        },
      |        {
      |            "key" : "Metacognitive",
      |            "value" : "Metacognitive"
      |        }
      |    ],
      |    "priorUses" : [
      |        {
      |            "key" : "Formative",
      |            "value" : "Formative"
      |        },
      |        {
      |            "key" : "Interim",
      |            "value" : "Interim"
      |        },
      |        {
      |            "key" : "Benchmark",
      |            "value" : "Benchmark"
      |        },
      |        {
      |            "key" : "Summative",
      |            "value" : "Summative"
      |        },
      |        {
      |            "key" : "Other",
      |            "value" : "Other"
      |        },
      |        {
      |            "key" : "International Benchmark",
      |            "value" : "International Benchmark"
      |        }
      |    ],
      |    "credentials" : [
      |        {
      |            "key" : "Assessment Developer",
      |            "value" : "Assessment Developer"
      |        },
      |        {
      |            "key" : "Test Item Writer",
      |            "value" : "Test Item Writer"
      |        },
      |        {
      |            "key" : "State Department of Education",
      |            "value" : "State Department of Education"
      |        },
      |        {
      |            "key" : "District Item Writer",
      |            "value" : "District Item Writer"
      |        },
      |        {
      |            "key" : "Teacher",
      |            "value" : "Teacher"
      |        },
      |        {
      |            "key" : "Student",
      |            "value" : "Student"
      |        },
      |        {
      |            "key" : "School Network",
      |            "value" : "School Network"
      |        },
      |        {
      |            "key" : "CMO",
      |            "value" : "CMO"
      |        },
      |        {
      |            "key" : "Other",
      |            "value" : "Other"
      |        }
      |    ],
      |    "licenseTypes" : [
      |        {
      |            "key" : "CC BY",
      |            "value" : "CC BY"
      |        },
      |        {
      |            "key" : "CC BY-SA",
      |            "value" : "CC BY-SA"
      |        },
      |        {
      |            "key" : "CC BY-NC",
      |            "value" : "CC BY-NC"
      |        },
      |        {
      |            "key" : "CC BY-ND",
      |            "value" : "CC BY-ND"
      |        },
      |        {
      |            "key" : "CC BY-NC-SA",
      |            "value" : "CC BY-NC-SA"
      |        }
      |    ],
      |    "itemTypes" : [
      |        {
      |            "key" : "Fixed Choice",
      |            "value" : [
      |                "Multiple Choice",
      |                "Multi-Multi Choice",
      |                "Visual Multi Choice",
      |                "Inline Choice",
      |                "Ordering",
      |                "Drag & Drop"
      |            ]
      |        },
      |        {
      |            "key" : "Constructed Response",
      |            "value" : [
      |                "Constructed Response - Short Answer",
      |                "Constructed Response - Open Ended"
      |            ]
      |        },
      |        {
      |            "key" : "Evidence",
      |            "value" : [
      |                "Select Evidence in Text",
      |                "Document Based Question",
      |                "Passage With Questions"
      |            ]
      |        },
      |        {
      |            "key" : "Composite",
      |            "value" : [
      |                "Composite - Multiple MC",
      |                "Composite - MC and SA",
      |                "Composite - MC, SA, OE",
      |                "Composite - Project",
      |                "Composite - Performance",
      |                "Composite - Activity",
      |                "Composite - Algebra"
      |            ]
      |        },
      |        {
      |            "key" : "Algebra",
      |            "value" : [
      |                "Plot Lines",
      |                "Plot Points",
      |                "Evaluate an Equation"
      |            ]
      |        }
      |    ],
      |    "gradeLevels" : [
      |        {
      |            "key" : "PK",
      |            "value" : "Prekindergarten"
      |        },
      |        {
      |            "key" : "KG",
      |            "value" : "Kindergarten"
      |        },
      |        {
      |            "key" : "01",
      |            "value" : "First grade"
      |        },
      |        {
      |            "key" : "02",
      |            "value" : "Second grade"
      |        },
      |        {
      |            "key" : "03",
      |            "value" : "Third grade"
      |        },
      |        {
      |            "key" : "04",
      |            "value" : "Fourth grade"
      |        },
      |        {
      |            "key" : "05",
      |            "value" : "Fifth grade"
      |        },
      |        {
      |            "key" : "06",
      |            "value" : "Sixth grade"
      |        },
      |        {
      |            "key" : "07",
      |            "value" : "Seventh grade"
      |        },
      |        {
      |            "key" : "08",
      |            "value" : "Eighth grade"
      |        },
      |        {
      |            "key" : "09",
      |            "value" : "Ninth grade"
      |        },
      |        {
      |            "key" : "10",
      |            "value" : "Tenth grade"
      |        },
      |        {
      |            "key" : "11",
      |            "value" : "Eleventh grade"
      |        },
      |        {
      |            "key" : "12",
      |            "value" : "Twelfth grade"
      |        },
      |        {
      |            "key" : "13",
      |            "value" : "Grade 13"
      |        },
      |        {
      |            "key" : "PS",
      |            "value" : "Postsecondary"
      |        },
      |        {
      |            "key" : "AP",
      |            "value" : "Advanced Placement"
      |        },
      |        {
      |            "key" : "UG",
      |            "value" : "Ungraded"
      |        }
      |    ],
      |    "reviewsPassed" : [
      |        {
      |            "key" : "Editorial",
      |            "value" : "Editorial"
      |        },
      |        {
      |            "key" : "Bias",
      |            "value" : "Bias"
      |        },
      |        {
      |            "key" : "Fairness",
      |            "value" : "Fairness"
      |        },
      |        {
      |            "key" : "Content",
      |            "value" : "Content"
      |        },
      |        {
      |            "key" : "Psychometric",
      |            "value" : "Psychometric"
      |        },
      |        {
      |            "key" : "All",
      |            "value" : "All"
      |        },
      |        {
      |            "key" : "None",
      |            "value" : "None"
      |        },
      |        {
      |            "key" : "Other",
      |            "value" : "Other"
      |        }
      |    ],
      |    "keySkills" : [
      |        {
      |            "key" : "Knowledge",
      |            "value" : [
      |                "Arrange",
      |                "Define",
      |                "Describe",
      |                "Duplicate",
      |                "Identify",
      |                "Label",
      |                "List",
      |                "Match",
      |                "Memorize",
      |                "Name",
      |                "Order",
      |                "Outline",
      |                "Recall",
      |                "Recognize",
      |                "Relate",
      |                "Repeat",
      |                "Reproduce",
      |                "Select",
      |                "State"
      |            ]
      |        },
      |        {
      |            "key" : "Understand",
      |            "value" : [
      |                "Classify",
      |                "Convert",
      |                "Defend",
      |                "Discuss",
      |                "Distinguish",
      |                "Estimate",
      |                "Example(s)",
      |                "Explain",
      |                "Express",
      |                "Extend",
      |                "Generalize",
      |                "Give",
      |                "Indicate",
      |                "Infer",
      |                "Locate",
      |                "Paraphrase",
      |                "Predict",
      |                "Review",
      |                "Rewrite",
      |                "Summarize",
      |                "Translate",
      |                "Understand"
      |            ]
      |        },
      |        {
      |            "key" : "Apply",
      |            "value" : [
      |                "Apply",
      |                "Change",
      |                "Choose",
      |                "Compute",
      |                "Demonstrate",
      |                "Discover",
      |                "Dramatize",
      |                "Employ",
      |                "Illustrate",
      |                "Interpret",
      |                "Manipulate",
      |                "Modify",
      |                "Operate",
      |                "Practice",
      |                "Prepare",
      |                "Produce",
      |                "Schedule",
      |                "Show",
      |                "Sketch",
      |                "Solve",
      |                "Use",
      |                "Write"
      |            ]
      |        },
      |        {
      |            "key" : "Analyze",
      |            "value" : [
      |                "Analyze",
      |                "Appraise",
      |                "Breakdown",
      |                "Calculate",
      |                "Categorize",
      |                "Compare",
      |                "Contrast",
      |                "Criticize",
      |                "Diagram",
      |                "Differentiate",
      |                "Discriminate",
      |                "Examine",
      |                "Experiment",
      |                "Infer",
      |                "Model",
      |                "Point-Out",
      |                "Question",
      |                "Separate",
      |                "Test"
      |            ]
      |        },
      |        {
      |            "key" : "Evaluate",
      |            "value" : [
      |                "Assemble",
      |                "Collect",
      |                "Combine",
      |                "Comply",
      |                "Devise",
      |                "Evaluate",
      |                "Explain",
      |                "Formulate",
      |                "Generate",
      |                "Plan",
      |                "Rearrange"
      |            ]
      |        },
      |        {
      |            "key" : "Create",
      |            "value" : [
      |                "Create",
      |                "Compose",
      |                "Construct",
      |                "Create",
      |                "Design",
      |                "Develop"
      |            ]
      |        }
      |    ]
      |}
    """.stripMargin

  def apply(): JsValue = Json.parse(jsonString)
}
