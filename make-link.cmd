echo "make folder base-commons-module"
rmdir /s /q node_modules\base-commons-module
mkdir node_modules\base-commons-module
mklink /H node_modules\base-commons-module\package.json ..\base-commons-module\package.json
mklink /H node_modules\base-commons-module\tsconfig.json ..\base-commons-module\tsconfig.json
mklink /J node_modules\base-commons-module\build ..\base-commons-module\build

echo "make core-client-commons"
rmdir /s /q node_modules\core-client-commons
mkdir node_modules\core-client-commons
mklink /H node_modules\core-client-commons\package.json ..\core-client-commons\package.json
mklink /H node_modules\core-client-commons\tsconfig.json ..\core-client-commons\tsconfig.json
mklink /J node_modules\core-client-commons\build ..\core-client-commons\build
