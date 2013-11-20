fs = require('fs')
http = require('http')
coffeeScript = require('coffee-script')
express = require('express')
routes = require('./web/routes')
packageJson = require('./package.json')


app = express()

app.set('views', __dirname + '/web/views')
app.set('view engine', 'jade')
app.use(express.bodyParser())

routes.init(app, packageJson)

port = process.env.PORT || 5000
app.set('port', port)


handler = -> console.log "Express server listening on port " + port

http.createServer(app).listen(app.get('port'), handler )
