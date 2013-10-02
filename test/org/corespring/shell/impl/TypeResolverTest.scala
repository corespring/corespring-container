package org.corespring.shell.impl

import org.specs2.mutable.Specification

class TypeResolverTest extends Specification{

  "TypeResolver" should {

    "find types" in {


      trait A {}
      trait B extends A
      trait C extends B


      TypeResolver.getType[C,B]( Seq(new C{}), classOf[B]) !== None

    }
  }

}
