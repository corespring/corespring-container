package org.corespring.container.js.rhino

import play.api.Logger

/**
 * Provides a definition of the methods which must be implemented for a Javascript logger.
 */
trait JsLogger {
  def log(msg: String*)
  def warn(msg: String*)
  def info(msg: String*)
  def debug(msg: String*)
}

/**
 * An implementation of JsLogger using Play's Logger
 */
class PlayJsLogger(log: Logger) extends JsLogger {
  def log(msg: String*) = log.info(msg.mkString(" "))
  def warn(msg: String*) = log.warn(msg.mkString(" "))
  def info(msg: String*) = log.info(msg.mkString(" "))
  def debug(msg: String*) = log.debug(msg.mkString(" "))
}

/**
 * The default logger implementation uses a PlayJsLogger.
 */
class DefaultLogger(log: Logger) extends JsConsoleImpl(new PlayJsLogger(log))


/**
 * Expanded signatures for forms possible calls to Javascript console.log. We tried to do implement with varargs in both
 * Java and Scala, but those method signatures actually use Arrays under the hood, and those signatures do not match the
 * expectations of the Javascript code.
 *
 * NOTE: It's possible that this can be refactored to pass the arguments object into a native Java/Scala call:
 *
 *   console.log = {
 *     javaImplementation(arguments);
 *   };
 *
 */
trait JsConsole {

  def log(msg: String)
  def log(msg: String, msg2: String)
  def log(msg: String, msg2: String, msg3: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String)

  def warn(msg: String)
  def warn(msg: String, msg2: String)
  def warn(msg: String, msg2: String, msg3: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String)

  def info(msg: String)
  def info(msg: String, msg2: String)
  def info(msg: String, msg2: String, msg3: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String)

  def debug(msg: String)
  def debug(msg: String, msg2: String)
  def debug(msg: String, msg2: String, msg3: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String)

}

/**
 * Implementation of JsConsole which uses a JsLogger to define the logging method implementations.
 */
class JsConsoleImpl(logger: JsLogger) extends JsConsole {

  def logImpl(msg: String*) = logger.log(msg:_*)
  def warnImpl(msg: String*) = logger.warn(msg:_*)
  def infoImpl(msg: String*) = logger.info(msg:_*)
  def debugImpl(msg: String*) = logger.debug(msg:_*)

  def log(msg: String): Unit = logImpl(msg)
  def log(msg: String, msg2: String): Unit = logImpl(msg, msg2)
  def log(msg: String, msg2: String, msg3: String): Unit = logImpl(msg, msg2, msg3)
  def log(msg: String, msg2: String, msg3: String, msg4: String): Unit = logImpl(msg, msg2, msg3, msg4)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19)
  def log(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String): Unit = logImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19, msg20)

  def warn(msg: String): Unit = warnImpl(msg)
  def warn(msg: String, msg2: String): Unit = warnImpl(msg, msg2)
  def warn(msg: String, msg2: String, msg3: String): Unit = warnImpl(msg, msg2, msg3)
  def warn(msg: String, msg2: String, msg3: String, msg4: String): Unit = warnImpl(msg, msg2, msg3, msg4)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19)
  def warn(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String): Unit = warnImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19, msg20)

  def info(msg: String): Unit = infoImpl(msg)
  def info(msg: String, msg2: String): Unit = infoImpl(msg, msg2)
  def info(msg: String, msg2: String, msg3: String): Unit = infoImpl(msg, msg2, msg3)
  def info(msg: String, msg2: String, msg3: String, msg4: String): Unit = infoImpl(msg, msg2, msg3, msg4)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19)
  def info(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String): Unit = infoImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19, msg20)

  def debug(msg: String): Unit = debugImpl(msg)
  def debug(msg: String, msg2: String): Unit = debugImpl(msg, msg2)
  def debug(msg: String, msg2: String, msg3: String): Unit = debugImpl(msg, msg2, msg3)
  def debug(msg: String, msg2: String, msg3: String, msg4: String): Unit = debugImpl(msg, msg2, msg3, msg4)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19)
  def debug(msg: String, msg2: String, msg3: String, msg4: String, msg5: String, msg6: String, msg7: String, msg8: String, msg9: String, msg10: String, msg11: String, msg12: String, msg13: String, msg14: String, msg15: String, msg16: String, msg17: String, msg18: String, msg19: String, msg20: String): Unit = debugImpl(msg, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11, msg12, msg13, msg14, msg15, msg16, msg17, msg18, msg19, msg20)

}
