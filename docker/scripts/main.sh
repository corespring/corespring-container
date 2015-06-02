#!/bin/bash

env

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

RUN_SCRIPT=$(find . -name "root")
echo "Found run script: $RUN_SCRIPT"

$RUN_SCRIPT

