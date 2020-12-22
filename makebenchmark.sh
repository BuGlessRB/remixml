#!/bin/sh

mspertest=100

(

echo "var engines = [];"

for engine in benchmark/engines/*.js
do
  echo "engines.push((function(){ var module = {};"
  cat $engine
  echo "return module.exports; })());"
done 

echo "var testsuite={};"

for dir in testsuite/*
do
  testname=$(basename $dir)
  echo "testsuite['$testname'] = {data:"
  cat $dir/data.json
  echo "};"
  for libfile in $dir/template.*
  do
    libname=${libfile##*.}
    echo "testsuite['$testname']['$libname'] = \`\\"
    sed -e 's/\([\\$`]\)/\\\1/g' <$libfile
    echo '`;'
  done
done

) >benchmark/engines.js
