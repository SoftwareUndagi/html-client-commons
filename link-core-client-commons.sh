#!/bin/bash
cd node_modules
rm -rf core-client-commons 
mkdir core-client-commons
cd core-client-commons
ln -s ../../../core-client-commons/build
ln -s ../../../core-client-commons/package.json
