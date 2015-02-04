package org.corespring.shell.controllers.data

import play.api.libs.json.{JsArray, JsObject, JsValue, Json}

object SubjectJson {

  def apply(): Seq[JsObject] = value.as[Seq[JsObject]].map((o => o ++ Json.obj("id" -> o \ "_id" \ "$oid")))

  val value = Json.parse(
    """
[
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2a7"
  },
  "subject":"",
  "category":"Art"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2a8"
  },
  "subject":"Performing Arts",
  "category":"Art"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2a9"
  },
  "subject":"AP Music Theory,Visual Arts",
  "category":"Art"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2aa"
  },
  "subject":"AP Art History",
  "category":"Art"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ab"
  },
  "subject":"Other",
  "category":"Art"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ac"
  },
  "subject":"",
  "category":"English Language Arts"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ad"
  },
  "subject":"English Language Arts",
  "category":"English Language Arts"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ae"
  },
  "subject":"AP English Literature",
  "category":"English Language Arts"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2af"
  },
  "subject":"Writing",
  "category":"English Language Arts"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b0"
  },
  "subject":"",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b1"
  },
  "subject":"Latin",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b2"
  },
  "subject":"AP Latin",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b3"
  },
  "subject":"French",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b4"
  },
  "subject":"AP French Language and Culture",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b5"
  },
  "subject":"Greek",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b6"
  },
  "subject":"English",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b7"
  },
  "subject":"AP English Language",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b8"
  },
  "subject":"Spanish",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2b9"
  },
  "subject":"AP German Language and Culture",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ba"
  },
  "subject":"German",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2bb"
  },
  "subject":"AP Italian Language and Culture",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2bc"
  },
  "subject":"Italian",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2bd"
  },
  "subject":"Chinese",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2be"
  },
  "subject":"AP Chinese language and Culture",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2bf"
  },
  "subject":"Russian",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c0"
  },
  "subject":"Arabic",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c1"
  },
  "subject":"Other",
  "category":"Language"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c2"
  },
  "subject":"",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c3"
  },
  "subject":"Algebra",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c4"
  },
  "subject":"AP Calculus AB",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c5"
  },
  "subject":"AP Calculus BC",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c6"
  },
  "subject":"Calculus",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c7"
  },
  "subject":"Geometry",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c8"
  },
  "subject":"General Mathematics",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2c9"
  },
  "subject":"Statistics",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ca"
  },
  "subject":"AP Statistics",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2cb"
  },
  "subject":"Trigonometry",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2cc"
  },
  "subject":"Other",
  "category":"Mathematics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2cd"
  },
  "subject":"",
  "category":"Physical Education"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ce"
  },
  "subject":"",
  "category":"Health Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2cf"
  },
  "subject":"",
  "category":"Politics"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d0"
  },
  "subject":"",
  "category":"Religion"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d1"
  },
  "subject":"",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d2"
  },
  "subject":"AP Biology",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d3"
  },
  "subject":"Biology",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d4"
  },
  "subject":"AP Chemistry",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d5"
  },
  "subject":"Chemistry",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d6"
  },
  "subject":"Environmental Science",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d7"
  },
  "subject":"AP environmental Science",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d8"
  },
  "subject":"Geology",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2d9"
  },
  "subject":"General Science",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2da"
  },
  "subject":"AP Physics B",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2db"
  },
  "subject":"AP Physics C",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2dc"
  },
  "subject":"Physics",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2dd"
  },
  "subject":"Other",
  "category":"Science"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2de"
  },
  "subject":"",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2df"
  },
  "subject":"AP US History",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e0"
  },
  "subject":"AP World History",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e1"
  },
  "subject":"AP Comp Government and Politics",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e2"
  },
  "subject":"AP US Government and Politics",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e3"
  },
  "subject":"AP Human Geography",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e4"
  },
  "subject":"Civics",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e5"
  },
  "subject":"Economics",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e6"
  },
  "subject":"Geography",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e7"
  },
  "subject":"History",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e8"
  },
  "subject":"US History",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2e9"
  },
  "subject":"European History",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ea"
  },
  "subject":"AP European History",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2eb"
  },
  "subject":"History",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ec"
  },
  "subject":"AP Macroeconomics",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ed"
  },
  "subject":"AP Microeconomics",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ee"
  },
  "subject":"AP Psychology",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2ef"
  },
  "subject":"Psychology",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f0"
  },
  "subject":"Social Studies",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f1"
  },
  "subject":"Other",
  "category":"Social Studies and History"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f2"
  },
  "subject":"",
  "category":"Technology"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f3"
  },
  "subject":"AP Computer Science",
  "category":"Technology"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f4"
  },
  "subject":"Computer",
  "category":"Technology"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f5"
  },
  "subject":"Textiles",
  "category":"Technology"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f6"
  },
  "subject":"Wood",
  "category":"Technology"
},
{
  "_id":{
    "$oid":"4ffb535f6bb41e469c0bf2f7"
  },
  "subject":"Other",
  "category":"Technology"
}
]
  """)
  }
