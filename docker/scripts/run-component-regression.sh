#!/bin/bash
set -e

echo " -- starting mongo"
mongod --fork --dbpath /var/lib/mongodb/ --smallfiles --logpath /var/log/mongodb.log --logappend

echo " -- seeding db"
cd /opt/utils/bin
npm install 
cd ..
./bin/seed-db

echo "boot fake s3"
fakes3 -r /opt/fake-s3-root -p 4567 &

cd /opt

echo "-- boot play app..."
./corespring-container/bin/root > play.out 2> play.err < /dev/null &

echo "starting xvfb"
service xvfb start
export DISPLAY=:10

#echo "-- npm install regression test runner ..."
#cd /opt/corespring-components
#npm install
#npm install grunt-cli

echo "-- run regression tests ..."
cd /opt/corespring-components
node ./node_modules/grunt-cli/bin/grunt regression --grep=$REGRESSION_GREP --timeout=$REGRESSION_TIMEOUT --baseUrl=$REGRESSION_BASE_URL


