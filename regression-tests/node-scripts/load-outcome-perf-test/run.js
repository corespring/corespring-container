
//create an item
//create a session
//call load-outcome many times

/**
 * Creates an item and a session then calls /load-outcome for that session 
 * repeatedly with a timeout
 * node run.js //will run against local db + server
 * node run.js mongodb://xxxxxxxxxxxxx@mongolab.com:49598/corespring-container-devt corespring-container-devt.herokuapp.com 20
 *
 */
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
      //console.log(dbItem[0]);
      //console.log(session);
      //console.log(dbItem[0]._id);
      session.itemId = dbItem[0]._id.toString();
      //console.log("id: " + session.itemId);
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
  //console.log(path)
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


  this.run = function(start, result, done) {
    // Set up the request
    var postReq = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        result.duration = new Date().getTime() - start;
        done();
      });
    });
    postReq.write(data);
    postReq.end();
  }
}



addItemAndSession(dbUri,
  item, session,
  function(err, dbResult) {
    console.log('done ..');
    var results = {};

    var indices = _.range(repeatCount);

    var runners = _.map(indices, function(i) {
      results[i] = {};
      return {
        index: i,
        result: results[i],
        runner: new Runner(i, settings, session)
      };
    });

    var done = _.after(runners.length, function(){

      console.log(JSON.stringify(results));
      var durations = _.pluck(results, 'duration');
      console.log(JSON.stringify(durations));

      var total = _.reduce(durations, function(a,b){return a + b}, 0);
      var average = total / durations.length;
      console.log('Average: ', average);
      //console.log(JSON)

    });
    _.forEach(runners, function(r) {
      setTimeout(function() {
        r.runner.run(new Date().getTime(), r.result, done);
      }, r.index * timeout);
    });

  })
