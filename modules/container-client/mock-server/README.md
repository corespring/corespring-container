# Mock Server

This server provides a client side only version of the editor or player.

## Running

    ./mock-server/bin/run

Then go to localhost:5000 and pass 2 query parameters:

* json - the path to a json file
* components - the path to the components

eg:

    http://localhost:5000/client/player.html?json=mock-server/sample-data/one.json&components=../../../corespring-components/components

