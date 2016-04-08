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
./corespring-container/bin/root

