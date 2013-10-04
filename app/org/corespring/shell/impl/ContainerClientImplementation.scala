package org.corespring.shell.impl

import org.corespring.container.components.model.Component
import org.corespring.container.components.response.{ResponseProcessorImpl, ResponseProcessor}
import org.corespring.shell.impl.controllers.editor.{ClientItemImpl, EditorHooksImpl}
import org.corespring.shell.impl.controllers.player.{ClientSessionImpl, PlayerHooksImpl}
import org.corespring.shell.impl.services.MongoService
import play.api.mvc.Controller

class ContainerClientImplementation(itemServiceIn : MongoService, sessionServiceIn : MongoService, comps : Seq[Component]) {

  lazy val controllers: Seq[Controller] = Seq(playerHooks, editorHooks, items, sessions)

  private lazy val playerHooks = new PlayerHooksImpl {

    def itemService: MongoService = itemServiceIn //new MongoService(db("items"))

    def loadedComponents: Seq[Component] = comps

    def sessionService: MongoService = sessionServiceIn //new MongoService(db("sessions"))
  }

  private lazy val editorHooks = new EditorHooksImpl {
    def itemService: MongoService = itemServiceIn

    def loadedComponents: Seq[Component] = comps
  }

  private lazy val items = new ClientItemImpl {
    def itemService: MongoService = itemServiceIn //new MongoService(db("items"))
  }

  private lazy val sessions = new ClientSessionImpl {
    def itemService: MongoService = itemServiceIn //new MongoService(db("items"))

    def responseProcessor: ResponseProcessor = new ResponseProcessorImpl(comps)

    def sessionService: MongoService = sessionServiceIn // MongoService(db("sessions"))

  }
}
