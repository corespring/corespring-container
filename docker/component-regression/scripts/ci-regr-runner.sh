#!/bin/bash
set -e

######################################################
# Run the component regression tests from a container slug
######################################################

echo "-- download slug"
if [ -z "$SLUG" ]; then
  echo "Missing SLUG env variable with the uri of the slug.";
 exit 1;
fi
wget -O /tmp/slug.tgz "$SLUG"
tar xvzf /tmp/slug.tgz
rm /tmp/slug.tgz

rm -fr /data/regression/components
mv app/corespring-components/components /data/regression/components
export CONTAINER_COMPONENTS_PATH=/data/regression/components

mv app /opt/corespring-container
if [ ! -f "/opt/corespring-container/bin/root" ]; then
  echo "Missing bin/root in container";
  exit 1;
fi

echo "-- starting xvfb"
service xvfb start
export DISPLAY=:10

echo "-- boot mongo"
mongod --fork --dbpath /var/lib/mongodb/ --smallfiles --logpath /var/log/mongodb.log --logappend

echo "-- boot fake s3"
fakes3 -r /opt/fake-s3-root -p 4567 &

echo "-- boot play app..."
cd /opt/corespring-container
./bin/root > /var/log/container.log 2> /var/log/container-err.log < /dev/null &

echo "-- waiting $WAIT_BEFORE_TEST seconds on the servers too boot"
for((c=$WAIT_BEFORE_TEST; c>=0; c--)); do echo -ne .; sleep 1; done
echo ""

echo "-- run regression tests ..."
cd /data/regression
grunt regression-from-docker --grep="$GREP" --invertGrep="$INVERT_GREP" --timeout="$TIMEOUT" --browserName="$BROWSER_NAME" --webDriverLogLevel="$WEB_DRIVER_LOG_LEVEL" --debug="$GRUNT_DEBUG"



 