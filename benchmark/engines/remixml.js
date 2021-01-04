var rxml = require('remixml');

function reverse(str) {
  // For the reverse helper
  var out = "", i = str.length;
  while (i > 0)
    out += str.charAt(--i);
  return out;
}

var $ = {
    "_":{},
    "var":{},
    "reverse":reverse,
   };

var incdom;

if (incdom = window["IncrementalDOM"])
  rxml.link_incrementaldom(IncrementalDOM);

module.exports = {
    name: 'remixml',
    ext: 'remixml',
  /*
    render2dom: function(parentnode, template, data, callback) {
        $._ = data;
        var abstract = template($);
        if (incdom) {
          callback(null, rxml.abstract2idom(parentnode, abstract));
	} else {
	  parentnode.textContent = "";
          callback(null, parentnode.appendChild(rxml.abstract2dom(abstract)));
	}
    },
  */
    render: function(template, data, callback) {
        $._ = data;
        callback(null, rxml.abstract2txt(template($), 1));
    },
    load: function(src, templatePath, templateName, callback) {
        callback(null, rxml.compile(src, 2) /* template */ );
    },
    compile: function(src, templatePath, templateName, callback) {
        callback(null, "module.exports=" + rxml.remixml2js(src));
    }
};
