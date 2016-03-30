#!/bin/bash

set -e

cbt artifact-deploy-from-file \
--heroku-app=corespring-container-devt \
--platform=jdk-1.7 \
--artifact-file=target/universal/root-0.65.0-SNAPSHOT.tgz \
--tag=tester \
--force=true

