def matchResult(arr:Seq[String]) = arr match {
  case Nil =>  "Nil"
  case head +: Nil => "head +: Nil"
  case head +: rest => "head +: rest"
  case Seq(one, two) => "one, two"
  case _ => "other"
}

def varArgResult(args:String*) = matchResult(args)

val ab = varArgResult("one", "two")
val se = matchResult(Seq("one", "two"))

println(ab)
println(se)
