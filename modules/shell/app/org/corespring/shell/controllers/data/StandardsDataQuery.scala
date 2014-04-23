package org.corespring.shell.controllers.data

import play.api.libs.json.{Json, JsValue, JsObject}


object StandardsDataQuery {

  def list(standards: Seq[JsObject], query: Option[String]): Seq[JsValue] = query.map {
    q => {
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
      val fields = (jsonQuery \ "fields").asOpt[Seq[String]]
      val filters = (jsonQuery \ "filters").asOpt[Seq[JsValue]]

      def applyFiltersToStandards(): Seq[JsObject] = {
        filters.map {
          filterList => {
            def matchesFilterList(s: JsObject): Boolean = {
              filterList.forall(filterItem => {
                (s \ (filterItem \ "field").as[String]).asOpt[String]
                  .map(s => s == (filterItem \ "value").as[String]).getOrElse(false)
              })
            }
            standards.filter(matchesFilterList)
          }
        }.getOrElse(standards)
      }

      def findMatchingStandards(standards: Seq[JsObject]): Seq[JsObject] = {
        searchTerm.map {
          term => {

            def filter(s: JsObject) = fields.map {

              def fieldContainsQueryString(field: String) =
                (s \ field).asOpt[String].map(s => s.contains(term)).getOrElse(false)

              fieldList: Seq[String] => fieldList.exists(fieldContainsQueryString)
            }.getOrElse(false)

            standards.filter(filter)
          }
        }.getOrElse(standards)
      }

      findMatchingStandards(applyFiltersToStandards())
    }
  }.getOrElse(standards)
}
