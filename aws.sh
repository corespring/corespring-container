#!/bin/sh

rm -fr bin/node_modules
rm -fr aws.zip 

TGZ=$(find target/universal -name "*.tgz")
zip -r aws.zip \
./Dockerfile \
docker \
$TGZ \
bin \
corespring-components/components \
mock-data
