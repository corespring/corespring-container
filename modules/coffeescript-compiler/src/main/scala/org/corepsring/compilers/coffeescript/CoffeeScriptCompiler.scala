package org.corepsring.compilers.coffeescript

//Lifted from Play
/*
 * Copyright (C) 2009-2013 Typesafe Inc. <http://www.typesafe.com>
 */

import java.io._

object CoffeescriptCompiler {

  import org.mozilla.javascript._
  import org.mozilla.javascript.tools.shell._

  private def read(f:File) : String = scala.io.Source.fromFile(f).getLines.mkString("\n")

  private lazy val compiler = {

    (source: File, bare: Boolean) =>
    {

      withJsContext { (ctx: Context, scope: Scriptable) =>
        val wrappedCoffeescriptCompiler = Context.javaToJS(this, scope)
        ScriptableObject.putProperty(scope, "CoffeescriptCompiler", wrappedCoffeescriptCompiler)

        ctx.evaluateReader(scope, new InputStreamReader(
          this.getClass.getClassLoader.getResource("coffee-script.js").openConnection().getInputStream()),
          "coffee-script.js",
          1, null)

        val coffee = scope.get("CoffeeScript", scope).asInstanceOf[NativeObject]
        val compilerFunction = coffee.get("compile", scope).asInstanceOf[Function]
        val coffeeCode = read(source)//.replace("\r", "")
        val options = ctx.newObject(scope)
        options.put("bare", options, bare)
        compilerFunction.call(ctx, scope, scope, Array(coffeeCode, options))
      }.toString
    }

  }

  /**
   * wrap function call into rhino context attached to current thread
   * and ensure that it exits right after
   * @param f their name
   */
  def withJsContext(f: (Context, Scriptable) => Any): Any = {
    val ctx = Context.enter
    ctx.setOptimizationLevel(-1)
    val global = new Global
    global.init(ctx)
    val scope = ctx.initStandardObjects(global)

    try {
      f(ctx, scope)
    } catch {
      case e: Exception => throw e;
    } finally {
      Context.exit
    }
  }

  private def executeNativeCompiler(in: String): String = {
    import scala.sys.process._
    val qb = Process(in)
    var out = List[String]()
    var err = List[String]()
    val exit = qb ! ProcessLogger((s) => out ::= s, (s) => err ::= s)
    if (exit != 0) {
      val eRegex = """.*Parse error on line (\d+):.*""".r
      val errReverse = err.reverse
      val r = eRegex.unapplySeq(errReverse.mkString("")).map(_.head.toInt)
      throw new RuntimeException(errReverse.mkString("\n"))
    }
    out.reverse.mkString("\n")
  }

  private def hasNativeCoffee: Boolean = {
    import scala.sys.process._
    "which coffee".! == 0
  }

  def compile(source: File, options: Seq[String]): String = {
    try {
      if (hasNativeCoffee) {
        val bare = if( options.contains("bare") ) "-b" else ""
        executeNativeCompiler( s"coffee -c -p $bare " + source.getAbsolutePath)
      } else {
        compiler(source, options.contains("bare"))
      }
    } catch {
      case e: JavaScriptException => {

        val line = """.*on line ([0-9]+).*""".r
        val error = e.getValue.asInstanceOf[Scriptable]

        throw ScriptableObject.getProperty(error, "message").toString match {
          case msg @ line(l) => {
            new RuntimeException( s"${source.getPath}, $msg, ${Integer.parseInt(l)}")
          }
          case msg => new RuntimeException( s"${source.getPath}, $msg")
        }

      }
    }
  }
}

