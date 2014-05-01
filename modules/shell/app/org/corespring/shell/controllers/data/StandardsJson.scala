package org.corespring.shell.controllers.data

import play.api.libs.json.{JsObject, Json}


object StandardsJson {

  def apply(): Seq[JsObject] = json.as[Seq[JsObject]]

  //Every 20th line of the cc-standards.json
  val json = Json.parse(
    """
      |[
      |{"id":"4ff47f6a6bb41e469c0be631","category":"Reading: Literature","dotNotation":"RL.1.3","guid":"B0933657FF5B43f58A270195497374CF","standard":"Describe characters, settings, and major events in a story, using key details.","subCategory":"Key Ideas and Details","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RL/1/3/","source":"HtmlParsed","grades":["01"]}
      |,{"id":"4ff47f6a6bb41e469c0be649","category":"Reading: Literature","dotNotation":"RL.3.7","guid":"03E66BC4F0B140c5927F798BF2FAD40D","standard":"Explain how specific aspects of a text’s illustrations contribute to what is conveyed by the words in a story (e.g., create mood, emphasize aspects of a character or setting)","subCategory":"Integration of Knowledge and Ideas","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RL/3/7/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"4ff47f6a6bb41e469c0be665","category":"Reading: Informational Text","dotNotation":"RI.K.5","guid":"105024249A1044b884DD15D7B4FABEF7","standard":"Identify the front cover, back cover, and title page of a book.","subCategory":"Craft and Structure","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RI/K/5/","source":"HtmlParsed","grades":["K"]}
      |,{"id":"4ff47f6a6bb41e469c0be67d","category":"Reading: Informational Text","dotNotation":"RI.2.9","guid":"58045C1D987F446d92163B119955C7A5","standard":"Compare and contrast the most important points presented by two texts on the same topic.","subCategory":"Integration of Knowledge and Ideas","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RI/2/9/","source":"HtmlParsed","grades":["02"]}
      |,{"id":"4ff47f6a6bb41e469c0be69a","category":"Reading: Informational Text","dotNotation":"RI.5.8","guid":"E2E476A3E3BB4783BE483DA8BB776416","standard":"Explain how an author uses reasons and evidence to support particular points in a text, identifying which reasons and evidence support which point(s).","subCategory":"Integration of Knowledge and Ideas","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RI/5/8/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"4ff47f6a6bb41e469c0be6b2","category":"Reading: Foundational Skills","dotNotation":"RF.1.2b","guid":"CADC5EE3EDBC456c91F0EB6044A9A065","standard":"Orally produce single-syllable words by blending sounds (phonemes), including consonant blends.","subCategory":"Phonological Awareness","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RF/1/2/b/","source":"HtmlParsed","grades":["01"]}
      |,{"id":"4ff47f6a6bb41e469c0be6d0","category":"Reading: Foundational Skills","dotNotation":"RF.3.3d","guid":"4E8AD84F8BA44e7185045B61EFFC6909","standard":"Read grade-appropriate irregularly spelled words.","subCategory":"Phonics and Word Recognition","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RF/3/3/d/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"4ff47f6a6bb41e469c0be701","category":"Writing","dotNotation":"W.3.1b","guid":"72AD5CD808D94cdf8064961A3EE8ADD8","standard":"Provide reasons that support the opinion.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/3/1/b/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"4ff47f6a6bb41e469c0be71c","category":"Writing","dotNotation":"W.4.2b","guid":"D81844619862461fB15B4138353BCE2E","standard":"Develop the topic with facts, definitions, concrete details, quotations, or other information and examples related to the topic.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/4/2/b/","source":"HtmlParsed","grades":["04"]}
      |,{"id":"4ff47f6b6bb41e469c0be744","category":"Writing","dotNotation":"W.5.8","guid":"5AAC4B8941604c2085547EB0E5491EA5","standard":"Recall relevant information from experiences or gather relevant information from print and digital sources; summarize or paraphrase information in notes and finished work, and provide a list of sources.","subCategory":"Research to Build and Present Knowledge","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/5/8/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"4ff47f6b6bb41e469c0be762","category":"Speaking & Listening","dotNotation":"SL.3.1a","guid":"C33FDDE7E6A64819B1A176AC790F0BFC","standard":"Come to discussions prepared, having read or studied required material; explicitly draw on that preparation and other information known about the topic to explore ideas under discussion.","subCategory":"Comprehension and Collaboration","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/SL/3/1/a/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"4ff47f6b6bb41e469c0be77c","category":"Speaking & Listening","dotNotation":"SL.5.4","guid":"870FD885576946cf855F282E97E6179B","standard":"Report on a topic or text or present an opinion, sequencing ideas logically and using appropriate facts and relevant, descriptive details to support main ideas or themes; speak clearly at an understandable pace.","subCategory":"Presentation of Knowledge and Ideas","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/SL/5/4/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"4ff47f6b6bb41e469c0be797","category":"Language","dotNotation":"L.1.1b","guid":"1B7E77E79A694a50825B27446D25B0A6","standard":"Use common, proper, and possessive nouns.","subCategory":"Conventions of Standard English","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/1/1/b/","source":"HtmlParsed","grades":["01"]}
      |,{"id":"4ff47f6b6bb41e469c0be7b5","category":"Language","dotNotation":"L.2.1d","guid":"BE3EA41F879A428d98EEA966A0703B99","standard":"Form and use the past tense of frequently occurring irregular verbs (e.g., <em>sat, hid, told</em>).","subCategory":"Conventions of Standard English","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/2/1/d/","source":"HtmlParsed","grades":["02"]}
      |,{"id":"4ff47f6b6bb41e469c0be7d1","category":"Language","dotNotation":"L.3.1g","guid":"21D1825CCD254b6bA1CCD791F8C89AE4","standard":"Form and use comparative and superlative adjectives and adverbs, and choose between them depending on what is to be modified.","subCategory":"Conventions of Standard English","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/3/1/g/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"4ff47f6b6bb41e469c0be7f3","category":"Language","dotNotation":"L.4.2b","guid":"F4E759CF258C4ccbACE2928A9674C9F3","standard":"Use commas and quotation marks to mark direct speech and quotations from a text.","subCategory":"Conventions of Standard English","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/4/2/b/","source":"HtmlParsed","grades":["04"]}
      |,{"id":"4ff47f6b6bb41e469c0be815","category":"Reading: Literature","dotNotation":"RL.6.5","guid":"F42CAF3A1E324c4dAC4DBB3DA5375D59","standard":"Analyze how a particular sentence, chapter, scene, or stanza fits into the overall structure of a text and contributes to the development of the theme, setting, or plot.","subCategory":"Craft and Structure","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RL/6/5/","source":"HtmlParsed","grades":["06"]}
      |,{"id":"4ff47f6b6bb41e469c0be831","category":"Reading: Literature","dotNotation":"RL.9-10.3","guid":"EF8BBB06ED9B4cdeAFBD242A3A46C4B7","standard":"Analyze how complex characters (e.g., those with multiple or conflicting motivations) develop over the course of a text, interact with other characters, and advance the plot or develop the theme.","subCategory":"Key Ideas and Details","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RL/9-10/3/","source":"HtmlParsed","grades":["09","10"]}
      |,{"id":"4ff47f6b6bb41e469c0be851","category":"Reading: Informational Text","dotNotation":"RI.7.5","guid":"3EE0DA3D310B4fe88E4ABA3AD4EFF112","standard":"Analyze the structure an author uses to organize a text, including how the major sections contribute to the whole and to the development of the ideas.","subCategory":"Craft and Structure","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RI/7/5/","source":"HtmlParsed","grades":["07"]}
      |,{"id":"4ff47f6b6bb41e469c0be86f","category":"Reading: Informational Text","dotNotation":"RI.11-12.5","guid":"EDDA6F729E0140e898D32CE7E8D48B80","standard":"Analyze and evaluate the effectiveness of the structure an author uses in his or her exposition or argument, including whether the structure makes points clear, convincing, and engaging.","subCategory":"Craft and Structure","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RI/11-12/5/","source":"HtmlParsed","grades":["11","12"]}
      |,{"id":"4ff47f6b6bb41e469c0be88a","category":"Writing","dotNotation":"W.6.6","guid":"DBA4C33166924bdfAB83D89CD08C363E","standard":"Use technology, including the Internet, to produce and publish writing as well as to interact and collaborate with others; demonstrate sufficient command of keyboarding skills to type a minimum of three pages in a single sitting.","subCategory":"Production and Distribution of Writing","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/6/6/","source":"HtmlParsed","grades":["06"]}
      |,{"id":"4ff47f6c6bb41e469c0be8b4","category":"Writing","dotNotation":"W.8.2a","guid":"127BF64930754c4dA04838C43E612492","standard":"Introduce a topic clearly, previewing what is to follow; organize ideas, concepts, and information into broader categories; include formatting (e.g., headings), graphics (e.g., charts, tables), and multimedia when useful to aiding comprehension.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/8/2/a/","source":"HtmlParsed","grades":["08"]}
      |,{"id":"4ff47f6c6bb41e469c0be8da","category":"Writing","dotNotation":"W.9-10.3d","guid":"D968E419AFDA453087B06E52F33666B4","standard":"Use precise words and phrases, telling details, and sensory language to convey a vivid picture of the experiences, events, setting, and/or characters.","subCategory":"Text Types and Purposes (continued)","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/9-10/3/d/","source":"HtmlParsed","grades":["09","10"]}
      |,{"id":"4ff47f6c6bb41e469c0be908","category":"Speaking & Listening","dotNotation":"SL.6.4","guid":"4CE9837CED3E4a5d9B856C5EDF03288A","standard":"Present claims and findings, sequencing ideas logically and using pertinent descriptions, facts, and details to accentuate main ideas or themes; use appropriate eye contact, adequate volume, and clear pronunciation.","subCategory":"Presentation of Knowledge and Ideas","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/SL/6/4/","source":"HtmlParsed","grades":["06"]}
      |,{"id":"4ff47f6c6bb41e469c0be924","category":"Speaking & Listening","dotNotation":"SL.9-10.2","guid":"160A3B9952EA4e7cBDD307AEE101AF40","standard":"Integrate multiple sources of information presented in diverse media or formats (e.g., visually, quantitatively, orally) evaluating the credibility and accuracy of each source.","subCategory":"Comprehension and Collaboration","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/SL/9-10/2/","source":"HtmlParsed","grades":["09","10"]}
      |,{"id":"4ff47f6c6bb41e469c0be949","category":"Language","dotNotation":"L.7.5b","guid":"8B482A56484F4730A8DDDFB8DF4A807B","standard":"Use the relationship between particular words (e.g., synonym/antonym, analogy) to better understand each of the words.","subCategory":"Vocabulary Acquisition and Use","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/7/5/b/","source":"HtmlParsed","grades":["07"]}
      |,{"id":"4ff47f6c6bb41e469c0be975","category":"Language","dotNotation":"L.11-12.1b","guid":"EAAEC33A333E4b4c8F7C96D6D4A08CCE","standard":"Resolve issues of complex or contested usage, consulting references (e.g., <em>Merriam-Webster’s Dictionary of English Usage, Garner’s Modern American Usage</em>) as needed.","subCategory":"Conventions of Standard English","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/11-12/1/b/","source":"HtmlParsed","grades":["11","12"]}
      |,{"id":"4ff47f6c6bb41e469c0be994","category":"English Language Arts Standards » History/Social Studies","dotNotation":"RH.9-10.7","guid":"ECD6B4E8A36047ae811792E20A8F4046","standard":"Integrate quantitative or technical analysis (e.g., charts, research data) with qualitative analysis in print or digital text.","subCategory":"Integration of Knowledge and Ideas","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RH/9-10/7/","source":"HtmlParsed","grades":["09","10"]}
      |,{"id":"4ff47f6c6bb41e469c0be9b8","category":"Science & Technical Subjects","dotNotation":"RST.11-12.3","guid":"AD46BD5C53C640a3B41330BB78C3E7B6","standard":"Follow precisely a complex multistep procedure when carrying out experiments, taking measurements, or performing technical tasks; analyze the specific results based on explanations in the text.","subCategory":"Key Ideas and Details","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RST/11-12/3/","source":"HtmlParsed","grades":["11","12"]}
      |,{"id":"4ff47f6d6bb41e469c0be9f1","category":"English Language Arts Standards » Writing","dotNotation":"WHST.11-12.2a","guid":"44718010D95644479F36F600AB553001","standard":"Introduce a topic and organize complex ideas, concepts, and information so that each new element builds on that which precedes it to create a unified whole; include formatting (e.g., headings), graphics (e.g., figures, tables), and multimedia when useful to aiding comprehension.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/WHST/11-12/2/a/","source":"HtmlParsed","grades":["11","12"]}
      |,{"id":"4ff47f6d6bb41e469c0bea0e","category":"Measurement & Data","dotNotation":"K.MD.A.2","guid":"4D3953649C704D4CAFC97E99C7A83EE9","standard":"Directly compare two objects with a measurable attribute in common, to see which object has &ldquo;more of&rdquo;/&ldquo;less of&rdquo; the attribute, and describe the difference. <i>For example, directly compare the heights of two children and describe one child as taller/shorter</i>.","subCategory":"Describe and compare measurable attributes.","subject":"Math","uri":"http://corestandards.org/Math/Content/K/MD/A/2/","source":"HtmlParsed","grades":["K"]}
      |,{"id":"4ff47f6d6bb41e469c0bea25","category":"Number & Operations in Base Ten","dotNotation":"1.NBT.C.5","guid":"B26DE2515D35459792503137FBF1BAC5","standard":"Given a two-digit number, mentally find 10 more or 10 less than the number, without having to count; explain the reasoning used.","subCategory":"Use place value understanding and properties of operations to add and subtract.","subject":"Math","uri":"http://corestandards.org/Math/Content/1/NBT/C/5/","source":"HtmlParsed","grades":["01"]}
      |,{"id":"4ff47f6d6bb41e469c0bea3c","category":"Number & Operations in Base Ten","dotNotation":"2.NBT.B.9","guid":"4AF9BD3141404800971E6C1F7AA3FC60","standard":"Explain why addition and subtraction strategies work, using place value and the properties of operations.<sup>1</sup>","subCategory":"Use place value understanding and properties of operations to add and subtract.","subject":"Math","uri":"http://corestandards.org/Math/Content/2/NBT/B/9/","source":"HtmlParsed","grades":["02"]}
      |,{"id":"4ff47f6d6bb41e469c0bea52","category":"Operations & Algebraic Thinking","dotNotation":"3.OA.D.9","guid":"C220B1257A75437196AEBEC0B0C4B4BC","standard":"Identify arithmetic patterns (including patterns in the addition table or multiplication table), and explain them using properties of operations. <i>For example, observe that 4 times a number is always even, and explain why 4 times a number can be decomposed into two equal addends</i>.","subCategory":"Solve problems involving the four operations, and identify and explain patterns in arithmetic.","subject":"Math","uri":"http://corestandards.org/Math/Content/3/OA/D/9/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"4ff47f6d6bb41e469c0bea67","category":"Measurement & Data","dotNotation":"3.MD.C.7","guid":"DB1670D9BA2E4F6BA040EEA5EE826670","standard":"Relate area to the operations of multiplication and addition.","subCategory":"Geometric measurement: understand concepts of area and relate area to multiplication and to addition.","subject":"Math","uri":"http://corestandards.org/Math/Content/3/MD/C/7/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"4ff47f6d6bb41e469c0bea7d","category":"Number & Operationsâ€”FractionsÂ¹","dotNotation":"4.NF.B.3a","guid":"F6933013AE4F438BB52517F900140E51","standard":"Understand addition and subtraction of fractions as joining and separating parts referring to the same whole.","subCategory":"Build fractions from unit fractions","subject":"Math","uri":"http://corestandards.org/Math/Content/4/NF/B/3/a/","source":"HtmlParsed","grades":["04"]}
      |,{"id":"4ff47f6d6bb41e469c0bea93","category":"Geometry","dotNotation":"4.G.A.3","guid":"B6CC34045B7B45F48CE0080E44852EEA","standard":"Recognize a line of symmetry for a two-dimensional figure as a line across the figure such that the figure can be folded along the line into matching parts. Identify line-symmetric figures and draw lines of symmetry.","subCategory":"Draw and identify lines and angles, and classify shapes by properties of their lines and angles.","subject":"Math","uri":"http://corestandards.org/Math/Content/4/G/A/3/","source":"HtmlParsed","grades":["04"]}
      |,{"id":"4ff47f6d6bb41e469c0beaa9","category":"Number & Operationsâ€”Fractions","dotNotation":"5.NF.B.6","guid":"50A2FAB14FBF4233BF4BAB88288DF277","standard":"Solve real world problems involving multiplication of fractions and mixed numbers, e.g., by using visual fraction models or equations to represent the problem.","subCategory":"Apply and extend previous understandings of multiplication and division.","subject":"Math","uri":"http://corestandards.org/Math/Content/5/NF/B/6/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"4ff47f6d6bb41e469c0beac3","category":"The Number System","dotNotation":"6.NS.A.1","guid":"345E28505AB943BFA287EC8FADBF95AD","standard":"Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions, e.g., by using visual fraction models and equations to represent the problem. <i>For example, create a story context for (2/3) &divide; (3/4) and use a visual fraction model to show the quotient; use the relationship between multiplication and division to explain that (2/3) &divide; (3/4) = 8/9 because 3/4 of 8/9 is 2/3. (In general, (a/b) &divide; (c/d) = ad/bc.) How much chocolate will each person get if 3 people share 1/2 lb of chocolate equally? How many 3/4-cup servings are in 2/3 of a cup of yogurt? How wide is a rectangular strip of land with length 3/4 mi and area 1/2 square mi? Compute fluently with multi-digit numbers and find common factors and multiples</i>.","subCategory":"Apply and extend previous understandings of multiplication and division.","subject":"Math","uri":"http://corestandards.org/Math/Content/6/NS/A/1/","source":"HtmlParsed","grades":["06"]}
      |,{"id":"4ff47f6d6bb41e469c0bead7","category":"Expressions & Equations","dotNotation":"6.EE.A.3","guid":"D9589DCAC5934C61B335D4C9160A6CD2","standard":"Apply the properties of operations to generate equivalent expressions. <i>For example, apply the distributive property to the expression 3 (2 + x) to produce the equivalent expression 6 + 3x; apply the distributive property to the expression 24x + 18y to produce the equivalent expression 6 (4x + 3y); apply properties of operations to y + y + y to produce the equivalent expression 3y</i>.","subCategory":"Apply and extend previous understandings of arithmetic to algebraic expressions.","subject":"Math","uri":"http://corestandards.org/Math/Content/6/EE/A/3/","source":"HtmlParsed","grades":["06"]}
      |,{"id":"4ff47f6e6bb41e469c0beaec","category":"Ratios & Proportional Relationships","dotNotation":"7.RP.A.2","guid":"A57D2EDF9830409CB97D9F8DBD6763DD","standard":"Recognize and represent proportional relationships between quantities.","subCategory":"Analyze proportional relationships and use them to solve real-world and mathematical problems.","subject":"Math","uri":"http://corestandards.org/Math/Content/7/RP/A/2/","source":"HtmlParsed","grades":["07"]}
      |,{"id":"4ff47f6e6bb41e469c0beb04","category":"Geometry","dotNotation":"7.G.A.2","guid":"BF9BA82A90C4445F90F97C8FADCC8943","standard":"Draw (freehand, with ruler and protractor, and with technology) geometric shapes with given conditions. Focus on constructing triangles from three measures of angles or sides, noticing when the conditions determine a unique triangle, more than one triangle, or no triangle.","subCategory":"Draw construct, and describe geometrical figures and describe the relationships between them.","subject":"Math","uri":"http://corestandards.org/Math/Content/7/G/A/2/","source":"HtmlParsed","grades":["07"]}
      |,{"id":"4ff47f6e6bb41e469c0beb19","category":"Expressions & Equations","dotNotation":"8.EE.A.2","guid":"5179CBDD896D4FD2973CDDAEC393C948","standard":"Use square root and cube root symbols to represent solutions to equations of the form <i>x</i><sup>2</sup> = <i>p</i> and <i>x</i><sup>3</sup> = p, where <i>p</i> is a positive rational number. Evaluate square roots of small perfect squares and cube roots of small perfect cubes. Know that &radic;2 is irrational.","subCategory":"Expressions and Equations Work with radicals and integer exponents.","subject":"Math","uri":"http://corestandards.org/Math/Content/8/EE/A/2/","source":"HtmlParsed","grades":["08"]}
      |,{"id":"4ff47f6e6bb41e469c0beb31","category":"Geometry","dotNotation":"8.G.A.5","guid":"548E34BC57CC4F3D9DBEE60D82B192A2","standard":"Use informal arguments to establish facts about the angle sum and exterior angle of triangles, about the angles created when parallel lines are cut by a transversal, and the angle-angle criterion for similarity of triangles. <i>For example, arrange three copies of the same triangle so that the sum of the three angles appears to form a line, and give an argument in terms of transversals why this is so</i>.","subCategory":"Understand congruence and similarity using physical models, transparencies, or geometry software.","subject":"Math","uri":"http://corestandards.org/Math/Content/8/G/A/5/","source":"HtmlParsed","grades":["08"]}
      |,{"id":"4ff47f6e6bb41e469c0beb46","category":"The Complex Number System","dotNotation":"HSN-CN.C.7","guid":"53E71723181C423483E2099E69FD1417","standard":"Solve quadratic equations with real coefficients that have complex solutions.","subCategory":"Use complex numbers in polynomial identities and equations.","subject":"Math","uri":"http://corestandards.org/Math/Content/HSN/CN/C/7/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"4ff47f6e6bb41e469c0beb5e","category":"Seeing Structure in Expressions","dotNotation":"HSA-SSE.B.3","guid":"C705AD3CCF9641C9A3101BDB10737B11","standard":"Choose and produce an equivalent form of an expression to reveal and explain properties of the quantity represented by the expression.<sup>★","subCategory":"Write expressions in equivalent forms to solve problems.","subject":"Math","uri":"http://corestandards.org/Math/Content/HSA/SSE/B/3/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"4ff47f6e6bb41e469c0beb74","category":"Reasoning with Equations & Inequalities","dotNotation":"HSA-REI.C.5","guid":"090DE6FDA67B45FEA288899B26A1E026","standard":"Prove that, given a system of two equations in two variables, replacing one equation by the sum of that equation and a multiple of the other produces a system with the same solutions.","subCategory":"Solve systems of equations.","subject":"Math","uri":"http://corestandards.org/Math/Content/HSA/REI/C/5/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"4ff47f6e6bb41e469c0beb89","category":"Interpreting Functions","dotNotation":"HSF-IF.C.8a","guid":"E8C42265F5F341ea9C0284AA7BDC65AE","standard":"Use the process of factoring and completing the square in a quadratic function to show zeros, extreme values, and symmetry of the graph, and interpret these in terms of a context.","subCategory":"Analyze functions using different representations.","subject":"Math","uri":"http://corestandards.org/Math/Content/HSF/IF/C/8/a/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"4ff47f6e6bb41e469c0beba0","category":"Trigonometric Functions","dotNotation":"HSF-TF.A.1","guid":"AD929225303444039816AB290ECA8E44","standard":"Understand radian measure of an angle as the length of the arc on the unit circle subtended by the angle.","subCategory":"Extend the domain of trigonometric functions using the unit circle.","subject":"Math","uri":"http://corestandards.org/Math/Content/HSF/TF/A/1/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"4ff47f6e6bb41e469c0bebb9","category":"Similarity, Right Triangles, & Trigonometry","dotNotation":"HSG-SRT.A.2","guid":"5EEC5B34D81048C481BF69158104FA25","standard":"Given two figures, use the definition of similarity in terms of similarity transformations to decide if they are similar; explain using similarity transformations the meaning of similarity for triangles as the equality of all corresponding pairs of angles and the proportionality of all corresponding pairs of sides.","subCategory":"Understand similarity in terms of similarity transformations","subject":"Math","uri":"http://corestandards.org/Math/Content/HSG/SRT/A/2/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"4ff47f6e6bb41e469c0bebd4","category":"Modeling with Geometry","dotNotation":"HSG-MG.A.2","guid":"84C0E5EB2B7A403F9FBEAD254BE4413E","standard":"Apply concepts of density based on area and volume in modeling situations (e.g., persons per square mile, BTUs per cubic foot).<sup>★","subCategory":"Apply geometric concepts in modeling situations","subject":"Math","uri":"http://corestandards.org/Math/Content/HSG/MG/A/2/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"4ff47f6e6bb41e469c0bebeb","category":"Conditional Probability & the Rules of Probability","dotNotation":"HSS-CP.A.4","guid":"CF9B6E500C504635B4557FE41DFF67BF","standard":"Construct and interpret two-way frequency tables of data when two categories are associated with each object being classified. Use the two-way table as a sample space to decide if events are independent and to approximate conditional probabilities. <i>For example, collect data from a random sample of students in your school on their favorite subject among math, science, and English. Estimate the probability that a randomly selected student from your school will favor science given that the student is in tenth grade. Do the same for other subjects and compare the results.</i>","subCategory":"Understand independence and conditional probability and use them to interpret data","subject":"Math","uri":"http://corestandards.org/Math/Content/HSS/CP/A/4/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"50bca7aa30047de5a0f50677","category":"Operations & Algebraic Thinking","dotNotation":"3.OA.A.4","guid":"ACB26A2ED7114E59911EE985D8D02B6D","standard":"Determine the unknown whole number in a multiplication or division equation relating three whole numbers. <i>For example, determine the unknown number that makes the equation true in each of the equations 8 &times; ? = 48, 5 = _ &divide; 3, 6 &times; 6 = ?</i>","subCategory":"Represent and solve problems involving multiplication and division.","subject":"Math","uri":"http://corestandards.org/Math/Content/3/OA/A/4/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"50bca7d130047de5a0f5068b","category":"Statistics & Probability","dotNotation":"7.SP.A.2","guid":"1E9C8DCF5D8B444AB189EFE40E899EAB","standard":"Use data from a random sample to draw inferences about a population with an unknown characteristic of interest. Generate multiple samples (or simulated samples) of the same size to gauge the variation in estimates or predictions. <i>For example, estimate the mean word length in a book by randomly sampling words from the book; predict the winner of a school election based on randomly sampled survey data. Gauge how far off the estimate or prediction might be</i>.","subCategory":"Use random sampling to draw inferences about a population.","subject":"Math","uri":"http://corestandards.org/Math/Content/7/SP/A/2/","source":"HtmlParsed","grades":["07"]}
      |,{"id":"50bca7f130047de5a0f5069f","category":"Congruence","dotNotation":"HSG-CO.C.11","guid":"7CB09509B566460F90CC39B61FE75B2F","standard":"Prove theorems about parallelograms. <i>Theorems include: opposite sides are congruent, opposite angles are congruent, the diagonals of a parallelogram bisect each other, and conversely, rectangles are parallelograms with congruent diagonals</i>.","subCategory":"Prove geometric theorems","subject":"Math","uri":"http://corestandards.org/Math/Content/HSG/CO/C/11/","source":"HtmlParsed","grades":["09","10","11","12"]}
      |,{"id":"50bca81430047de5a0f506da","category":"Reading: Literature","dotNotation":"RL.5.10","guid":"73C8942CBD1D400fBFBA34DDC875B8E7","standard":"By the end of the year, read and comprehend literature, including stories, dramas, and poetry, at the high end of the grades 4–5 text complexity band independently and proficiently.","subCategory":"Range of Reading and Level of Text Complexity","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RL/5/10/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"50bca82430047de5a0f506f3","category":"Reading: Informational Text","dotNotation":"RI.5.10","guid":"B8014690EA344db8BFE422DA1DA539ED","standard":"By the end of the year, read and comprehend informational texts, including history/social studies, science, and technical texts, at the high end of the grades 4&ndash;5 text complexity band independently and proficiently.","subCategory":"Range of Reading and Level of Text Complexity","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RI/5/10/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"50bca83430047de5a0f50707","category":"Reading: Foundational Skills","dotNotation":"RF.4.4a","guid":"47B0B50F4783470887325B0A8368925D","standard":"Read grade-level text with purpose and understanding.","subCategory":"Fluency","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RF/4/4/a/","source":"HtmlParsed","grades":["04"]}
      |,{"id":"50bca83f30047de5a0f50725","category":"Writing","dotNotation":"W.6.4","guid":"5D85EA56671244569D37C3716C9A557B","standard":"Produce clear and coherent writing in which the development, organization, and style are appropriate to task, purpose, and audience. (Grade-specific expectations for writing types are defined in standards 1&ndash;3 above.)","subCategory":"Production and Distribution of Writing","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/6/4/","source":"HtmlParsed","grades":["06"]}
      |,{"id":"50bca84530047de5a0f50739","category":"Writing","dotNotation":"W.11-12.9a","guid":"B6FCA3A7E8D04107B7BCEB894DFB95E2","standard":"Apply g<i>rades 11&ndash;12 Reading standards</i> to literature (e.g., &ldquo;Demonstrate knowledge of eighteenth-, nineteenth- and early-twentieth-century foundational works of American literature, including how two or more texts from the same period treat similar themes or topics&rdquo;).","subCategory":"Research to Build and Present Knowledge","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/11-12/9/a/","source":"HtmlParsed","grades":["11","12"]}
      |,{"id":"50bca85230047de5a0f5074d","category":"Speaking & Listening","dotNotation":"SL.11-12.1","guid":"161DCFEBB47B4046A4E8F7B551FD0B41","standard":"Initiate and participate effectively in a range of collaborative discussions (one-on-one, in groups, and teacher-led) with diverse partners on grades 11–12 topics, texts, and issues, building on others’ ideas and expressing their own clearly and persuasively.","subCategory":"Comprehension and Collaboration","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/SL/11-12/1/","source":"HtmlParsed","grades":["11","12"]}
      |,{"id":"50bca85930047de5a0f50763","category":"Language","dotNotation":"L.3.5c","guid":"69DD4F819A6843a1BE7D33FE219E72F4","standard":"Distinguish shades of meaning among related words that describe states of mind or degrees of certainty (e.g., <em>knew, believed, suspected, heard, wondered</em>).","subCategory":"Vocabulary Acquisition and Use","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/3/5/c/","source":"HtmlParsed","grades":["03"]}
      |,{"id":"50bca85d30047de5a0f50777","category":"Language","dotNotation":"L.6.3a","guid":"B87BE93FE3874e6c939E8F6A86BA3384","standard":"Vary sentence patterns for meaning, reader/listener interest, and style.*","subCategory":"Knowledge of Language","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/6/3/a/","source":"HtmlParsed","grades":["06"]}
      |,{"id":"50bca86130047de5a0f5078b","category":"Language","dotNotation":"L.9-10.4b","guid":"3A307E92B91A4d78A0F3AD7356D31B92","standard":"Identify and correctly use patterns of word changes that indicate different meanings or parts of speech (e.g., <em>analyze, analysis, analytical; advocate, advocacy</em>).","subCategory":"Vocabulary Acquisition and Use","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/9-10/4/b/","source":"HtmlParsed","grades":["09","10"]}
      |,{"id":"50bca86830047de5a0f5079f","category":"Science & Technical Subjects","dotNotation":"RST.9-10.10","guid":"B1D0FFA6CF6A4b93AE4A9DCF0D5B28A2","standard":"By the end of grade 10, read and comprehend science/technical texts in the grades 9–10 text complexity band independently and proficiently.","subCategory":"Range of Reading and Level of Text Complexity","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RST/9-10/10/","source":"HtmlParsed","grades":["09","10"]}
      |,{"id":"50bca86e30047de5a0f507b3","category":"Reading: Informational Text","dotNotation":"RI.7.1","guid":"0FB68FE324294a04A6A655A1A2E1E793","standard":"Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.","subCategory":"Key Ideas and Details","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RI/7/1/","source":"HtmlParsed","grades":["07"]}
      |,{"id":"50bca86e30047de5a0f507c7","category":"Reading: Foundational Skills","dotNotation":"RF.5.4","guid":"12AF65CD0A9643c5A7CEEFEA24755B65","standard":"Read with sufficient accuracy and fluency to support comprehension.","subCategory":"Fluency","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/RF/5/4/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"50bca86e30047de5a0f507db","category":"Writing","dotNotation":"W.5.9","guid":"1F660FD3F00148cdA44B0D5BC3B48218","standard":"Draw evidence from literary or informational texts to support analysis, reflection, and research.","subCategory":"Research to Build and Present Knowledge","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/5/9/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"50bca86e30047de5a0f507ef","category":"Writing","dotNotation":"W.8.1e","guid":"7D25D15B107A45c98D0CEA9AD23A929B","standard":"Provide a concluding statement or section that follows from and supports the argument presented.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/8/1/e/","source":"HtmlParsed","grades":["08"]}
      |,{"id":"50bca86e30047de5a0f50803","category":"Writing","dotNotation":"W.11-12.2e","guid":"09A448877DC3442e892F7470058649A5","standard":"Establish and maintain a formal style and objective tone while attending to the norms and conventions of the discipline in which they are writing.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/W/11-12/2/e/","source":"HtmlParsed","grades":["11","12"]}
      |,{"id":"50bca86f30047de5a0f50817","category":"Language","dotNotation":"L.K.2","guid":"8DC8E2BF1D274098AADA8ADB5AE294D9","standard":"Demonstrate command of the conventions of standard English capitalization, punctuation, and spelling when writing.","subCategory":"Conventions of Standard English","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/K/2/","source":"HtmlParsed","grades":["K"]}
      |,{"id":"50bca86f30047de5a0f5082b","category":"Language","dotNotation":"L.5.4c","guid":"A8EA54B94C7A4e2bA9082FA357C3F7EC","standard":"Consult reference materials (e.g., dictionaries, glossaries, thesauruses), both print and digital, to find the pronunciation and determine or clarify the precise meaning of key words and phrases.","subCategory":"Vocabulary Acquisition and Use","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/5/4/c/","source":"HtmlParsed","grades":["05"]}
      |,{"id":"50bca86f30047de5a0f5083f","category":"Language","dotNotation":"L.8.4c","guid":"1208F642D1044742ACF7CC46E90DDAC0","standard":"Consult general and specialized reference materials (e.g., dictionaries, glossaries, thesauruses), both print and digital, to find the pronunciation of a word or determine or clarify its precise meaning or its part of speech.","subCategory":"Vocabulary Acquisition and Use","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/L/8/4/c/","source":"HtmlParsed","grades":["08"]}
      |,{"id":"50bca86f30047de5a0f50853","category":"English Language Arts Standards » Writing","dotNotation":"WHST.6-8.2b","guid":"882415FF81EC4000B1BD1730DBD4FD83","standard":"Develop the topic with relevant, well-chosen facts, definitions, concrete details, quotations, or other information and examples.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/WHST/6-8/2/b/","source":"HtmlParsed","grades":["06","07","08"]}
      |,{"id":"50bca86f30047de5a0f50867","category":"English Language Arts Standards » Writing","dotNotation":"WHST.11-12.1e","guid":"B42F4ABBDB544d138E4CAB09B582CF80","standard":"Provide a concluding statement or section that follows from or supports the argument presented.","subCategory":"Text Types and Purposes","subject":"ELA-Literacy","uri":"http://corestandards.org/ELA-Literacy/WHST/11-12/1/e/","source":"HtmlParsed","grades":["11","12"]}
      |]
    """.stripMargin
  )
}
