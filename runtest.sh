#!/bin/sh

for dir in testsuite/*
do
  rm $dir/output.*
  node - <<HERE
const fs = require("fs");
//var rxml = require("./remixml.min.js");
var rxml = require("./remixml.js");

var remixmlsrc = fs.readFileSync("$dir/input.remixml").toString();
console.log(remixmlsrc);
var data = fs.readFileSync("$dir/input.json").toString();

var jssrc = rxml.remixml2js(remixmlsrc);
fs.writeFileSync("$dir/output.min.js", jssrc);
var macrofn = rxml.js2obj(jssrc);

var abstract = macrofn({"_":eval(data)});
fs.writeFileSync("$dir/output.remixml", rxml.abstract2txt(abstract));
HERE
  js-beautify -s 2 $dir/output.min.js >$dir/output.js
done
