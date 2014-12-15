package org.corespring.shell.controllers.data

import play.api.libs.json.{ Json, JsValue, JsObject }

object StandardsDataQuery {

  def list(standards: Seq[JsObject], query: Option[String]): Seq[JsValue] = query.map {
    q =>
      {
        /**
         * The query string contains a json object like this
         * {searchTerm:"some string", fields: [field1, field2], filter:[{field:"field", value:"value"}]}
         *
         * searchTerm is what the user has entered into the standards search
         *
         * fields contains the names of the fields that should be searched for searchTerm
         * If any of the fields contains the searchTerm, the item is in
         *
         * filter contains the fields that have to be exact matches
         *
         * So the complete logic for the search would be
         * (item[fields[0]] contains searchTerm
         * || item[fields[1]] contains searchTerm
         * || item[fields[..]] contains searchTerm)
         * && (item[filter[0].field] == filter[0].value )
         * && (item[filter[1].field] == filter[1].value )
         * && (item[filter[..].field] == filter[..].value )
         */
        val jsonQuery = Json.parse(q)

        val searchTerm = (jsonQuery \ "searchTerm").asOpt[String]
        val fields = Some(Array("subject", "dotNotation", "category", "subCategory"))
        val filters = (jsonQuery \ "filters").asOpt[Map[String,String]]

        def matchAllFilters(s: JsObject): Boolean = filters.map {
          filterObject: Map[String, String] =>
            filterObject.forall { case (key, value) => {
              (s \ key).asOpt[String]
                .map(s => s == value)
                .getOrElse(false)
            }
            }
        }.getOrElse(true)

        def findSearchTermInOneField(s: JsObject): Boolean = (for {
          term <- searchTerm
          fieldList <- fields
        } yield fieldList.exists(
          field => (s \ field).asOpt[String]
            .map(s => s.toLowerCase().contains(term.toLowerCase()))
            .getOrElse(false))).getOrElse(true)

        standards.filter(matchAllFilters).filter(findSearchTermInOneField)
      }
  }.getOrElse(standards)
}
