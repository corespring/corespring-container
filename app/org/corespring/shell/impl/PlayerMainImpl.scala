package org.corespring.shell.impl

import org.corespring.container.components.model.Component

class PlayerMainImpl(val itemService: ItemService, val components : Seq[Component]) extends PlayerMain

