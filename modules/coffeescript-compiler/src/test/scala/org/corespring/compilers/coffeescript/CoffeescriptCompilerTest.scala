package org.corespring.compilers.coffeescript

import org.specs2.mutable.Specification
import org.corepsring.compilers.coffeescript.CoffeescriptCompiler
import java.io.File


class CoffeescriptCompilerTest extends Specification {

  def printToFile(f: java.io.File)(op: java.io.PrintWriter => Unit) {
    val p = new java.io.PrintWriter(f)
    try { op(p) } finally { p.close() }
  }

  "Compiler" should {
    "compile" in {
      val f = new File("tmp.coffee")
      printToFile(f){ p => p.println("console.log \"hello there\"")}
      val coffee = CoffeescriptCompiler.compile(f, Seq("bare"))
      coffee.trim === """console.log("hello there");"""
    }
  }

}
