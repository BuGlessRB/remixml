#!/bin/sh

dirs="$@"
test -z "$dirs" && dirs="*"

ok=0

for dir in testsuite/$dirs
do
  rm -f $dir/output.*
  node - <<HERE
const fs = require("fs");
var rxml = require("./remixml.min.js");
//var rxml = require("./remixml.js");

var remixmlsrc = fs.readFileSync("$dir/input.remixml").toString();
var data = fs.readFileSync("$dir/input.json").toString();

var jssrc = rxml.remixml2js(remixmlsrc);
fs.writeFileSync("$dir/output.min.js", jssrc);
var macrofn = rxml.js2obj(jssrc);

var abstract = macrofn({"_":eval("("+data+")")});
fs.writeFileSync("$dir/output.remixml", rxml.abstract2txt(abstract));
HERE
  js-beautify -s 2 $dir/output.min.js >$dir/output.js
  if cmp -s $dir/target.remixml $dir/output.remixml
  then
    echo Succeed: $dir
  else
    echo "************************** Failed: $dir"
    ok=1
    ( cat <<\HERE
<html>
<head>
 <script src="remixml.js"></script>
 <script>
  var rxml = Remixml;
  var data = {"_":
HERE
     cat $dir/input.json
     cat <<\HERE
  };
  var compfn = rxml.compile(`
HERE
     cat $dir/input.remixml
     cat <<\HERE
  `);
  var abstract = compfn(data);
  var html = rxml.abstract2txt(abstract);
  var dom = rxml.abstract2dom(abstract);
  console.log(html);
  console.log(compfn);
  console.log(dom);
 </script>
</head>
<body>
 Test me harder!
</body>
</html>
HERE
  ) >testsuite.html
  fi
done

exit $ok
