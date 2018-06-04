#!/bin/bash
cd node_modules
rm -rf base-commons-module
rm -rf core-client-commons 
mkdir core-client-commons
mkdir  base-commons-module
cd core-client-commons
ln -s ../../../core-client-commons/build
ln -s ../../../core-client-commons/dist
ln -s ../../../core-client-commons/package.json
cd ..
cd base-commons-module
ln -s ../../../base-commons-module/build
ln -s ../../../base-commons-module/dist
ln -s ../../../base-commons-module/package.json