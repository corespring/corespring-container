package org.corespring.shell.controllers.data

import play.api.libs.json.{ JsObject, Json }

object StandardsTreeJson {

  def apply(): Seq[JsObject] = value

  val value = Seq(
    Json.obj(
      "name" -> "All",
      "items" -> Json.arr()),
    Json.obj(
      "name" -> "ELA-Literacy",
      "items" -> Json.arr(
        Json.obj(
          "name" -> "All",
          "items" -> Json.arr()),
        Json.obj(
          "name" -> "Reading-> Literature",
          "items" -> Json.arr(
            "All",
            "Key Ideas and Details",
            "Craft and Structure",
            "Integration of Knowledge and Ideas",
            "Range of Reading and Level of Text Complexity")),
        Json.obj(
          "name" -> "Reading-> Informational Text",
          "items" -> Json.arr(
            "All",
            "Key Ideas and Details",
            "Craft and Structure",
            "Integration of Knowledge and Ideas",
            "Range of Reading and Level of Text Complexity")),
        Json.obj(
          "name" -> "Reading-> Foundational Skills",
          "items" -> Json.arr(
            "All",
            "Print Concepts",
            "Phonological Awareness",
            "Phonics and Word Recognition",
            "Fluency")),
        Json.obj(
          "name" -> "Writing",
          "items" -> Json.arr(
            "All",
            "Text Types and Purposes",
            "Production and Distribution of Writing",
            "Research to Build and Present Knowledge",
            "Range of Writing",
            "Text Types and Purposes (continued)")),
        Json.obj(
          "name" -> "English Language Arts Standards » Anchor Standards",
          "items" -> Json.arr(
            "All",
            "Research to Build and Present Knowledge",
            "Conventions of Standard English",
            "Vocabulary Acquisition and Use",
            "Integration of Knowledge and Ideas",
            "Range of Writing",
            "Production and Distribution of Writing",
            "Key Ideas and Details",
            "Craft and Structure",
            "Range of Reading and Level of Text Complexity",
            "Text Types and Purposes1",
            "Comprehension and Collaboration",
            "Presentation of Knowledge and Ideas",
            "Knowledge of Language")),
        Json.obj(
          "name" -> "Speaking & Listening",
          "items" -> Json.arr(
            "All",
            "Comprehension and Collaboration",
            "Presentation of Knowledge and Ideas")),
        Json.obj(
          "name" -> "Language",
          "items" -> Json.arr(
            "All",
            "Conventions of Standard English",
            "Vocabulary Acquisition and Use",
            "Knowledge of Language")),
        Json.obj(
          "name" -> "English Language Arts Standards » History/Social Studies",
          "items" -> Json.arr(
            "All",
            "Key Ideas and Details",
            "Craft and Structure",
            "Integration of Knowledge and Ideas",
            "Range of Reading and Level of Text Complexity")),
        Json.obj(
          "name" -> "Science & Technical Subjects",
          "items" -> Json.arr(
            "All",
            "Key Ideas and Details",
            "Craft and Structure",
            "Integration of Knowledge and Ideas",
            "Range of Reading and Level of Text Complexity")),
        Json.obj(
          "name" -> "English Language Arts Standards » Writing",
          "items" -> Json.arr(
            "All",
            "Text Types and Purposes",
            "Production and Distribution of Writing",
            "Research to Build and Present Knowledge",
            "Range of Writing")))),
    Json.obj(
      "name" -> "ELA",
      "items" -> Json.arr(
        Json.obj(
          "name" -> "All",
          "items" -> Json.arr()),
        Json.obj(
          "name" -> "Writing",
          "items" -> Json.arr(
            "All",
            "Research to Build and Present Knowledge",
            "Text Types and Purposes")))),
    Json.obj(
      "name" -> "Math",
      "items" -> Json.arr(
        Json.obj(
          "name" -> "All",
          "items" -> Json.arr()),
        Json.obj(
          "name" -> "Counting & Cardinality",
          "items" -> Json.arr(
            "All",
            "Know number names and the count sequence.",
            "Count to tell the number of objects.",
            "Compare numbers.")),
        Json.obj(
          "name" -> "Operations & Algebraic Thinking",
          "items" -> Json.arr(
            "All",
            "Understand addition, and understand subtraction.",
            "Represent and solve problems involving addition and subtraction.",
            "Understand and apply properties of operations and the relationship between addition and subtraction.",
            "Add and subtract within 20.",
            "Work with addition and subtraction equations.",
            "Work with equal groups of objects to gain foundations for multiplication.",
            "Represent and solve problems involving multiplication and division.",
            "Understand properties of multiplication and the relationship between multiplication and division.",
            "Multiply and divide within 100.",
            "Solve problems involving the four operations, and identify and explain patterns in arithmetic.",
            "Use the four operations with whole numbers to solve problems.",
            "Gain familiarity with factors and multiples.",
            "Generate and analyze patterns.",
            "Write and interpret numerical expressions.",
            "Analyze patterns and relationships.")),
        Json.obj(
          "name" -> "Number & Operations in Base Ten",
          "items" -> Json.arr(
            "All",
            "Work with numbers 11-19 to gain foundations for place value.",
            "Extend the counting sequence.",
            "Understand place value.",
            "Use place value understanding and properties of operations to add and subtract.",
            "Use place value understanding and properties of operations to perform multi-digit arithmetic.",
            "Generalize place value understanding for multi-digit whole numbers.",
            "Understand the place value system.",
            "Perform operations with multi-digit whole numbers and with decimals to hundredths.")),
        Json.obj(
          "name" -> "Measurement & Data",
          "items" -> Json.arr(
            "All",
            "Describe and compare measurable attributes.",
            "Classify objects and count the number of objects in each category.",
            "Measure lengths indirectly and by iterating length units.",
            "Tell and write time.",
            "Represent and interpret data.",
            "Measure and estimate lengths in standard units.",
            "Relate addition and subtraction to length.",
            "Work with time and money.",
            "Solve problems involving measurement and estimation.",
            "Geometric measurement-> understand concepts of area and relate area to multiplication and to addition.",
            "Geometric measurement-> recognize perimeter.",
            "Solve problems involving measurement and conversion of measurements.",
            "Geometric measurement-> understand concepts of angle and measure angles.",
            "Convert like measurement units within a given measurement system.",
            "Geometric measurement-> understand concepts of volume.")),
        Json.obj(
          "name" -> "Geometry",
          "items" -> Json.arr(
            "All",
            "Identify and describe shapes.",
            "Analyze, compare, create, and compose shapes.",
            "Reason with shapes and their attributes.",
            "Draw and identify lines and angles, and classify shapes by properties of their lines and angles.",
            "Graph points on the coordinate plane to solve real-world and mathematical problems.",
            "Classify two-dimensional figures into categories based on their properties.",
            "Solve real-world and mathematical problems involving area, surface area, and volume.",
            "Draw construct, and describe geometrical figures and describe the relationships between them.",
            "Solve real-life and mathematical problems involving angle measure, area, surface area, and volume.",
            "Understand congruence and similarity using physical models, transparencies, or geometry software.",
            "Understand and apply the Pythagorean Theorem.",
            "Solve real-world and mathematical problems involving volume of cylinders, cones, and spheres.")),
         Json.obj(
          "name" -> "Number & Operations Fractions",
          "items" -> Json.arr(
            "All",
            "Develop understanding of fractions as numbers.",
            "Extend understanding of fraction equivalence and ordering.",
            "Build fractions from unit fractions",
            "Understand decimal notation for fractions, and compare decimal fractions.",
            "Use equivalent fractions as a strategy to add and subtract fractions.",
            "Apply and extend previous understandings of multiplication and division.")),
        Json.obj(
          "name" -> "Ratios & Proportional Relationships",
          "items" -> Json.arr(
            "All",
            "Understand ratio concepts and use ratio reasoning to solve problems.",
            "Analyze proportional relationships and use them to solve real-world and mathematical problems.")),
        Json.obj(
          "name" -> "The Number System",
          "items" -> Json.arr(
            "All",
            "Apply and extend previous understandings of multiplication and division.",
            "Compute fluently with multi-digit numbers and find common factors and multiples.",
            "Apply and extend previous understandings of numbers to the system of rational numbers.",
            "Apply and extend previous understandings of operations with fractions.",
            "Know that there are numbers that are not rational, and approximate them by rational numbers.")),
        Json.obj(
          "name" -> "Expressions & Equations",
          "items" -> Json.arr(
            "All",
            "Apply and extend previous understandings of arithmetic to algebraic expressions.",
            "Reason about and solve one-variable equations and inequalities.",
            "Represent and analyze quantitative relationships between dependent and independent variables.",
            "Use properties of operations to generate equivalent expressions.",
            "Solve real-life and mathematical problems using numerical and algebraic expressions and equations.",
            "Expressions and Equations Work with radicals and integer exponents.",
            "Understand the connections between proportional relationships, lines, and linear equations.",
            "Analyze and solve linear equations and pairs of simultaneous linear equations.")),
        Json.obj(
          "name" -> "Statistics & Probability",
          "items" -> Json.arr(
            "All",
            "Develop understanding of statistical variability.",
            "Summarize and describe distributions.",
            "Use random sampling to draw inferences about a population.",
            "Draw informal comparative inferences about two populations.",
            "Investigate chance processes and develop, use, and evaluate probability models.",
            "Investigate patterns of association in bivariate data.")),
        Json.obj(
          "name" -> "Functions",
          "items" -> Json.arr(
            "All",
            "Define, evaluate, and compare functions.",
            "Use functions to model relationships between quantities.")),
        Json.obj(
          "name" -> "The Real Number System",
          "items" -> Json.arr(
            "All",
            "Extend the properties of exponents to rational exponents.",
            "Use properties of rational and irrational numbers.")),
        Json.obj(
          "name" -> "Quantities*",
          "items" -> Json.arr(
            "All",
            "Reason quantitatively and use units to solve problems.")),
        Json.obj(
          "name" -> "The Complex Number System",
          "items" -> Json.arr(
            "All",
            "Perform arithmetic operations with complex numbers.",
            "Represent complex numbers and their operations on the complex plane.",
            "Use complex numbers in polynomial identities and equations.")),
        Json.obj(
          "name" -> "Vector & Matrix Quantities",
          "items" -> Json.arr(
            "All",
            "Represent and model with vector quantities.",
            "Perform operations on vectors.",
            "Perform operations on matrices and use matrices in applications.")),
        Json.obj(
          "name" -> "Seeing Structure in Expressions",
          "items" -> Json.arr(
            "All",
            "Interpret the structure of expressions.",
            "Write expressions in equivalent forms to solve problems.")),
        Json.obj(
          "name" -> "Arithmetic with Polynomials & Rational Expressions",
          "items" -> Json.arr(
            "All",
            "Perform arithmetic operations on polynomials.",
            "Understand the relationship between zeros and factors of polynomials.",
            "Use polynomial identities to solve problems.",
            "Rewrite rational expressions.")),
        Json.obj(
          "name" -> "Creating Equations*",
          "items" -> Json.arr(
            "All",
            "Create equations that describe numbers or relationships.")),
        Json.obj(
          "name" -> "Reasoning with Equations & Inequalities",
          "items" -> Json.arr(
            "All",
            "Understand solving equations as a process of reasoning and explain the reasoning.",
            "Solve equations and inequalities in one variable.",
            "Solve systems of equations.",
            "Represent and solve equations and inequalities graphically.")),
        Json.obj(
          "name" -> "Interpreting Functions",
          "items" -> Json.arr(
            "All",
            "Understand the concept of a function and use function notation.",
            "Interpret functions that arise in applications in terms of the context.",
            "Analyze functions using different representations.")),
        Json.obj(
          "name" -> "Building Functions",
          "items" -> Json.arr(
            "All",
            "Build a function that models a relationship between two quantities.",
            "Build new functions from existing functions.")),
        Json.obj(
          "name" -> "Linear, Quadratic, & Exponential Models*",
          "items" -> Json.arr(
            "All",
            "Construct and compare linear, quadratic, and exponential models and solve problems.",
            "Interpret expressions for functions in terms of the situation they model.")),
        Json.obj(
          "name" -> "Trigonometric Functions",
          "items" -> Json.arr(
            "All",
            "Extend the domain of trigonometric functions using the unit circle.",
            "Model periodic phenomena with trigonometric functions.",
            "Prove and apply trigonometric identities.")),
        Json.obj(
          "name" -> "Congruence",
          "items" -> Json.arr(
            "All",
            "Experiment with transformations in the plane",
            "Understand congruence in terms of rigid motions",
            "Prove geometric theorems",
            "Make geometric constructions")),
        Json.obj(
          "name" -> "Similarity, Right Triangles, & Trigonometry",
          "items" -> Json.arr(
            "All",
            "Understand similarity in terms of similarity transformations",
            "Define trigonometric ratios and solve problems involving right triangles",
            "Apply trigonometry to general triangles",
            "Prove theorems involving similarity")),
        Json.obj(
          "name" -> "Circles",
          "items" -> Json.arr(
            "All",
            "Understand and apply theorems about circles",
            "Find arc lengths and areas of sectors of circles")),
        Json.obj(
          "name" -> "Expressing Geometric Properties with Equations",
          "items" -> Json.arr(
            "All",
            "Translate between the geometric description and the equation for a conic section",
            "Use coordinates to prove simple geometric theorems algebraically")),
        Json.obj(
          "name" -> "Geometric Measurement & Dimension",
          "items" -> Json.arr(
            "All",
            "Explain volume formulas and use them to solve problems",
            "Visualize relationships between two-dimensional and three-dimensional objects")),
        Json.obj(
          "name" -> "Modeling with Geometry",
          "items" -> Json.arr(
            "All",
            "Apply geometric concepts in modeling situations")),
        Json.obj(
          "name" -> "Interpreting Categorical & Quantitative Data",
          "items" -> Json.arr(
            "All",
            "Summarize, represent, and interpret data on a single count or measurement variable",
            "Summarize, represent, and interpret data on two categorical and quantitative variables",
            "Interpret linear models")),
        Json.obj(
          "name" -> "Making Inferences & Justifying Conclusions",
          "items" -> Json.arr(
            "All",
            "Understand and evaluate random processes underlying statistical experiments",
            "Make inferences and justify conclusions from sample surveys, experiments, and observational studies")),
        Json.obj(
          "name" -> "Conditional Probability & the Rules of Probability",
          "items" -> Json.arr(
            "All",
            "Understand independence and conditional probability and use them to interpret data",
            "Use the rules of probability to compute probabilities of compound events.")),
        Json.obj(
          "name" -> "Using Probability to Make Decisions",
          "items" -> Json.arr(
            "All",
            "Calculate expected values and use them to solve problems",
            "Use probability to evaluate outcomes of decisions")))))
}