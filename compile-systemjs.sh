#!/bin/bash
sh link-core-client-commons-systemjs.sh
tsc -p tsconfig.systemjs.json
sh link-core-client-commons.sh