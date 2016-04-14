#!/bin/bash
set -e

######################################################
# Run the component regression tests
######################################################

echo "-- starting xvfb"
service xvfb start
export DISPLAY=:10

echo "-- boot mongo"
mongod --fork --dbpath /var/lib/mongodb/ --smallfiles --logpath /var/log/mongodb.log --logappend

echo "-- boot fake s3"
fakes3 -r /opt/fake-s3-root -p 4567 &

echo "-- boot play app..."
cd /data/container
./bin/root > /var/log/container.log 2> /var/log/container-err.log < /dev/null &

echo "-- waiting $WAIT_BEFORE_TEST seconds on the servers too boot"
for((c=$WAIT_BEFORE_TEST; c>=0; c--)); do echo -ne .; sleep 1; done
echo ""

echo "-- run regression tests ..."
cd /data/regression
grunt regression-from-docker --grep="$GREP" --invertGrep="$INVERT_GREP" --timeout="$TIMEOUT" --browserName="$BROWSER_NAME" --webDriverLogLevel="$WEB_DRIVER_LOG_LEVEL" --debug="$GRUNT_DEBUG"



 