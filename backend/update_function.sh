#!/usr/bin/env bash 
zip -rMM ./lambda ./node_modules app.js index.js
aws lambda update-function-code --function-name gifs-gifsBL-mobilehub-19
6790592 --zip-file fileb://lambda.zip