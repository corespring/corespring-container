package org.corespring.shell.impl

import play.api.{Logger, GlobalSettings}
import play.api.mvc.Controller

trait ControllerInstanceResolver extends GlobalSettings {

  def controllers : Seq[Controller]

  lazy val logger = Logger("instance-resolver")

  override def getControllerInstance[A](controllerClass: Class[A]): A = {

    def isSuper(test: Class[_], target: Class[A]): Boolean = {

      println(s"issuper: ${test.getName}")
      if (test == null) {
        return false
      }
      if (test.getSuperclass == target) {
        true
      } else {
        if ( test.getSuperclass == null || test.getSuperclass.getName == "java.lang.Object") {
          false
        } else {
          isSuper(test.getSuperclass, target)
        }
      }
    }

    def isCorrectType(p: Class[_]): Boolean =  {
      logger.debug(s"isCorrectType: ${p.getName}")
      p == controllerClass
    }

    //TODO: tidy up
    def matches(c: Class[_]) : Boolean = {
      logger.info(s"matches ${c.getName}")

      if(c.getName == "java.lang.Object"){
        return false
      }

      if( c == controllerClass ){
        true
      } else {
        val interfaces = c.getInterfaces.toList
        val existsAsInterface = interfaces.exists(isCorrectType)
        if(existsAsInterface){
          return true
        } else {
          if( matches(c.getSuperclass) ){
            return true
          }
          else if( interfaces.exists(matches)){
            return true
          }
        }
      }
      false
    }

    controllers.find {
      (c: Controller) => {
        val cType = c.asInstanceOf[Object].getClass
        val m = matches(cType)
        println(m)
        m
      }
    } match {
      case Some(c) => {
        Logger.debug("Found an implementation for " + controllerClass + ": " + c)
        c.asInstanceOf[A]
      }
      case _ => throw new RuntimeException("Can't find controller for: " + controllerClass)
    }
  }
}
