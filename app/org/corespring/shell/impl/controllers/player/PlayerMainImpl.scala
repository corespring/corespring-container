package org.corespring.shell.impl.controllers.player

import org.corespring.container.components.model.Component
import org.corespring.shell.impl.services.MongoService

class PlayerMainImpl(val itemService: MongoService, val components : Seq[Component]) extends PlayerMain

