package org.corespring.container.js.processing

import org.corespring.container.components.model.dependencies.{ ComponentSplitter, DependencyResolver }
import org.corespring.container.components.model.{ Component, Interaction, Library }
import org.corespring.container.components.processing.{ PlayerItemPreProcessor => PreProcessor }
import org.corespring.container.js.api.GetServerLogic
import play.api.libs.json._

trait PlayerItemPreProcessor extends PreProcessor with GetServerLogic with ComponentSplitter {

  def components: Seq[Component]

  lazy val dependencyResolver = new DependencyResolver {
    override def components: Seq[Component] = PlayerItemPreProcessor.this.components
  }

  def preProcessItemForPlayer(item: JsValue): JsValue = {

    def processComponent(id: String): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      interactions.find(_.matchesType(componentType)).map {
        i =>

          def hasRenderFunction: Boolean = {
            val renderFunctionRegexp = "(?s)exports(\\.|\\[\")preprocess[^;]*?=[^;]*function".r
            renderFunctionRegexp.findFirstIn(i.server.definition).isDefined
          }

          if (!hasRenderFunction) {
            (id, question)
          } else {
            val sortedLibs = dependencyResolver.filterByType[Library](dependencyResolver.resolveComponents(Seq(i.id)).filterNot(_.id.orgNameMatch(i.id)))
            val serverComponent = serverLogic(i.componentType, i.server.definition, sortedLibs)
            (id, serverComponent.preProcessItem(question))
          }
      }.getOrElse((id, JsObject(Seq.empty)))
    }

    val componentQuestions = (item \ "components").as[JsObject]

    val processedItem: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.map(processComponent(_))
    val processedJson = JsObject(processedItem)

    val jsonTransformer = (__ \ 'components).json.update(
      __.read[JsObject].map {
        o => processedJson
      })

    item.transform(jsonTransformer) match {
      case succ: JsSuccess[JsObject] => succ.get
      case _ => item
    }

  }

}
