exports.init = (app) -> 
  

  app.get '/', (req, res) ->
    res.render("index")

  app.get '/test-player', (req, res) ->
    res.render("test-player")
