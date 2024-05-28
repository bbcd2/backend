@echo off

rem Zip up download.js, index.js, package.json, and .env into ../output/backend.zip

mkdir ..\output
mkdir ..\output\backend
copy package.json ..\output\backend
copy download.js ..\output\backend
copy index.js ..\output\backend
