package org.corespring.container.client.controllers.helpers

import java.io.StringWriter
import javax.xml.transform.TransformerFactory
import javax.xml.transform.sax.SAXSource
import javax.xml.transform.stream.StreamResult

import org.apache.commons.io.IOUtils
import org.ccil.cowan.tagsoup.Parser
import org.xml.sax.InputSource

import scala.xml._

trait TagSoupHTMLCleaner extends HTMLCleaner {

  def clean(xhtml: String) = {
    //Remove the namespace, and return the contents of the <body/>. For some reason TagSoup adds these things.
    (clearNamespace(sanitize(xhtml)) \ "body").map(_.child).flatten.mkString
  }

  /**
   * Returns the result of running the XHTML through TagSoup's parser as a NodeSeq
   */
  private def sanitize(xhtml: String): NodeSeq = {
    val parser = new Parser()
    parser.setFeature(Parser.defaultAttributesFeature, false)
    val writer = new StringWriter()
    val transformer = TransformerFactory.newInstance().newTransformer()
    transformer.transform(new SAXSource(parser, new InputSource(IOUtils.toInputStream(xhtml))), new StreamResult(writer))
    XML.loadString(writer.toString)
  }

  private def clearNamespace(node: Node): Node = node match {
    case elem: Elem => elem.copy(scope = TopScope, child = elem.child.map(clearNamespace))
    case _ => node
  }

  private def clearNamespace(seq: Seq[Node]): Seq[Node] = seq.map(clearNamespace)

}
