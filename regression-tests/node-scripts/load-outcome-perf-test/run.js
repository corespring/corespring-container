//create an item
//create a session
//call load-outcome many times
var _ = require('lodash');
var dbUri = process.argv[2] || 'mongodb://localhost/corespring-container';
var serverName = process.argv[3] || 'localhost';
var port = serverName == 'localhost' ? 9000 : 80;
var repeatCount = parseInt(process.argv[4] || '20');
var timeout = parseInt(process.argv[5] || '1000');

console.log('db: ', dbUri);
console.log('sever: ', serverName);

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var item = require('./item');
var session = require('./session');

function addItemAndSession(uri, item, session, done) {
  MongoClient.connect(uri, function(err, db) {
    var collection = db.collection('items');

    item.profile.taskInfo.title = 'peft test item';

    collection.insert(item, function(err, dbItem) {
      console.log(dbItem[0]);
      console.log(session);
      console.log(dbItem[0]._id);
      session.itemId = dbItem[0]._id.toString();
      console.log("id: " + session.itemId);
      db.collection('sessions').insert(session, function(err, dbSession) {
        db.close();
        console.log('session: ', dbSession)
        done(err, {
          item: dbItem,
          session: dbSession[0]
        });
      });
    });
  });
}

var http = require('http')
var settings = {
  showFeedback: true
};

function Runner(index, settings, session) {
  var data = JSON.stringify(settings);
  var length = Buffer.byteLength(data, 'utf8');
  var path = '/client/session/load-outcome/' + session._id + '.json';
  console.log(path)
  var options = {
    host: serverName,
    port: port,
    path: path,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': length
    }
  };


  this.run = function(start) {
    // Set up the request
    var postReq = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        console.log(index, 'Response: ' + chunk);
        console.log(index, 'Duration: ', new Date().getTime() - start)
      });
    });
    console.log(index, 'Run request ---->', start)
    postReq.write(data);
    postReq.end();
  }
}


addItemAndSession(dbUri,
  item, session,
  function(err, dbResult) {
    console.log('done ..');

    var indices = _.range(repeatCount);

    var runners = _.map(indices, function(i) {
      return {
        index: i,
        runner: new Runner(i, settings, session)
      };
    });

    _.forEach(runners, function(r) {
      setTimeout(function() {
        r.runner.run(new Date().getTime());
      }, r.index * timeout);
    });

  })