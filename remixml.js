   // RemixML v1.3: XML/HTML-like macro language
  // Copyright (c) 2018 by Stephen R. van den Berg <srb@cuci.nl>
 // License: ISC OR GPL-3.0
// Sponsored by: Cubic Circle, The Netherlands

!function(W, D, O)
{ "use strict";
  const al = /[&<]/;

  function isstring(s)
  { return O.prototype.toString.call(s) === "[object String]"; }

  function eumap(s)
  { return {"+":"%2B"," ":"+","?":"%3F","&":"%26","#":"%23"}[s]; }

  function isa(s) { return Array.isArray(s); }
  function newel(n) { return D.createElement(n); }
  function replelm(n, o) { return o.parentNode.replaceChild(n, o); }
  function gattr(n, k) { return n.getAttribute(k); }
  function sattr(n, k, v) { n.setAttribute(k, v); }
  function rattr(n, k) { n.removeAttribute(k); }

  function getdf(n)
  { let k = D.createRange();
    k.selectNodeContents(n);
    return k.extractContents();
  }

  function dfhtml(n)
  { let k = newel("div"); k.appendChild(n); return k.innerHTML; }

  function dfnone(n)
  { var j;
nostr:
    switch (n.nodeType)
    { case 11:
	switch (n.childNodes.length)
	{ case 0: return "";
	  default:
	    break nostr;
	  case 1:
	    if ((j = n.firstChild).nodeType == 3)
	      n = j.nodeValue;
	    else
	      break nostr;
	}
      case undefined:
	if ((j = n.indexOf("&")) < 0 || n.indexOf(";", j + 2) < 0)
	  return n;
    }
    j = txta;
    switch (n.nodeType)
    { case 11: j.appendChild(n); n = j;
      default: n = n.innerHTML;
      case undefined:
    }
    j.innerHTML = n; n = j.value; j.textContent = "";
    return n;
  }

  function txt2node(t)
  { return t.nodeType ? t : (diva.innerHTML = t, getdf(diva)); }

  W.sizeof = function(s)
  { return s ? s.nodeType ? dfnone(s).length : s.length || O.keys(s).length : 0;
  };

  function fvar(s, $, val)
  { let i, j;
    i = (s = s.split(".")).shift();
    if (val === undefined)
    { for ($ = $[i]; $ && ($ = $[s.shift()], s.length); );
      return $;
    }
    do
    { if (!(j = $[i]))
	$[i] = j = {};
      $ = j; i = s.shift();
    } while (s.length);
    $[i] = val;
  }

  function encpath(s)
  { return s.toLowerCase()
		.replace(/[^\0-~]/g, function(a) { return diacr[a] || a; })
		.replace(/(?:&(?:[^&;\s]*;)?|[^&a-z0-9])+/g, "-")
		.replace(/^-|[\u0300-\u036f]|-$/g, "");
  }

  function insert(j, quot, fmt, $)
  { if ((j = fvar(j, $)) != null)
    { if (j.nodeType)
      { j = j.cloneNode(1);
	switch (quot)
	{ case "none":case "":case "recurse":case "r":
	    if (!fmt)
	      break;
	  default: j = dfhtml(j);
	}
      } else if (-(-j) == j)
	j += "";
      else if (typeof j == "function")
	j = j($._, $);
      if (fmt && isstring(j))
      { fmt = fmt.match(
	 /^([-+0]+)?([1-9][0-9]*)?(?:\.([0-9]+))?([a-zA-Z]|[A-Z]{3})?$/);
	let p = fmt[3], lang = $.sys && $.sys.lang || undefined;
	switch (fmt[4])
	{ case "c": j = String.fromCharCode(+j); break;
	  case "d": j = parseInt(j, 10).toLocaleString(); break;
	  case "e": j = (+j).toExponential(p > "" ? p : null); break;
	  case "f":
	    if (!(p > ""))
	      p = 6;
	    p++;
	    j = (+j).toLocaleString(lang,
	     {minimumFractionDigits: p, maximumFractionDigits: p});
	    break;
	  case "g": j = (+j).toPrecision(p > "" ? p : 6); break;
	  case "x": j = (parseInt(j, 10) >>> 0).toString(16); break;
	  case "s":
	    if (p > "")
	      j = j.substr(0, p);
	    break;
	  default:
	    if (fmt[4].length == 3)
	      j = (+j).toLocaleString(lang,
	       {style:"currency", currency:fmt[4]});
	}
	if (fmt[1] && fmt[1].test("+"))
	  j = j.replace("-", "+");
	// Explicitly do not support padding (yet?)
      }
      switch (quot)
      { case "json": j = JSON.stringify(j); break;
	case "uric": j = j.replace(/[+ ?&#]/g, eumap); break;
	case "path": j = encpath(j); break;
	default:
	  if (isstring(j))
	    j = D.createTextNode(j);
	case "none": case "":case "recurse": case "r":;
      }
      $._._ok = 1;
    } else
      $._._ok = 0, j = "";
    return j;
  }

  function replent(s, $)
  { function r(s)
    { let c, i;
      if (s.nodeType)
      { if (c = s.firstChild)
	{ do
	    if ((i = r(c)) != c)
	      if (i.nodeType)
		s.replaceChild(i, c = i.lastChild || c);
	      else
		c.nodeValue = i;
	  while(c = c.nextChild);
	  return s;
	}
	s = c.nodeValue;
      }
      if ((i = s.split(/&(\w+\.\w+(?:\.\w+)*)(?::(\w*))?(?:%([-+\w.]*))?;/))
       .length > 1)
      { s = i.shift();
	do
	{ let j = i.shift();
	  c = i.shift(); j = insert(j, c, i.shift(), $);
	  switch (c)
	  { case "recurse":case "r":
	      j = r(j);
	  }
	  c = i.shift();
	  if (!isstring(j))
	  { if (j.nodeType)
	    { if (!s.lastChild)
		s = txt2node(s);
	      s.appendChild(j); j = "";
	    } else
	    { if (!s)
	      { s = c ? [j, c]: j;
		continue;
	      }
	      if (!isa(s))
		s = [s];
	    }
	  }
	  if (isa(s))
	  { s.push(j);
	    if (c)
	      s.push(j);
	  }
	  else if (j += c)
	    if (c = s.lastChild)
	      if (c.nodeType == 3 && j.search(al) < 0)
		c.nodeValue += j;
	      else
		s.appendChild(txt2node(j));
	    else if (j.search(al) < 0)
	      s += j;
	    else
	      s = txt2node(s + j);
	} while (i.length);
      }
      return s;
    }
    return r(s);
  }

  function jsfunc(j)
  { let e;
    if (!(e = fcache[j]))
      fcache[j] = e = Function("$", '"use strict";var _=$._;' + j);
    return e;
  }

  function trim(s)
  { var n = s.firstChild, i;
    if (n)
      do
      { i = n.nextChild;
	if (n.nodeType == 8)		// Strip comment nodes
	  s.removeChild(n);
	else
	  trim(n);
      } while (n = i);
    else
      s.nodeValue = s.nodeValue.replace(/\s\s+/g,' ');
  }

  function btrim(e)
  { var k;
    e.normalize(); trim(e);
    if ((k = e.firstChild) && k.nodeType == 3)
      k.nodeValue = k.nodeValue.trimStart();
    if ((k = e.lastChild) && k.nodeType == 3)
      k.nodeValue = k.nodeValue.trimEnd();
    return e;
  }

  function parse(n, $)
  { function eparse(n) { var k; parse(k = getdf(n), $); return k; }
    var j, rt, cc = bref && {};
    n = n.firstChild;
next:
    while (n)
    { let k, e, c, ca;
      function gatt(k) { return gattr(n, k); }
      function repltag(e)
      { let j, t;
	if (j = e.lastChild)
	  t = n, n = j, replelm(e, t);
	else if (j = e.nodeValue)
	  replelm(e, n), n = e;
	return !j;
      }
      function newctx(k, j, e)
      { let o$ = $, at, _, i, v, r;
	if (e)
	{ at = e.attributes;
	  if (k[2])		// !noparse
	    e = eparse(e);
	}
	($ = O.assign({}, $))._ = _ = {_:$._, _tag:O.assign({}, $._._tag)};
	if (k[1])
	  $[k[1]] = _;
	if (e)
	{ _._contents = e; _._restargs = r = {};
	  for (i = at.length; i--; )
	  { v = _[e = at[i].name] = at[i].value;
	    if (!k[3][e])       // args
	      r[e] = v;
	  }
	}
	if (j)
	  O.assign(_, j);
	j = eparse(k[0].cloneNode(1)); ($ = o$)._ = o$._;
	return j;
      }
      function pexpr(c)
      { let j;
	return (j = gatt("expr")) != null && (c || j)
	    && jsfunc(!j && c ? dfnone(c) : "return(" + dfnone(j) + ");");
      }
      function pregx()
      { let j;
	return (j = gatt("regexp")) != null
	    && (rcache[j] || (rcache[j] = RegExp(j)));
      }
      function ret(e) { return repltag(txt2node(e)); }
      function pret() { return repltag(eparse(n)); }
drop:  do {
keep:   do
	{ c = 0;
	  function cp(x) { c && c.push(x); }
	  if (k = n.attributes)
	  { let x = 0;
	    function prat(j)
	    { let e, i = k[j], s = i.value;
	      if (!c || s.length > 4 && s.indexOf("&") >= 0)
	      { if ((e = replent(s, $)).nodeType)
		  e = dfnone(e);
		else if (i.name == "::")
		{ x = e; cp(j);
		  return;
		}
		if (s != e)
		  i.value = e, cp(j);
	      }
	    }
	    function prost()
	    { if (x)
	      { let j;
		rattr(n, "::");
		for (j in x)
		  sattr(n, j, x[j]);
	      }
	    }
	    if (ca = gatt(":"))
	      rattr(n, ":");
	    if (ca && isa(ca = JSON.parse(ca)))
	      for (j in ca)
		if (ca[j] < 0)
		{ prost();
		  break keep;
		}
		else
		  prat(ca[j]);
	    else
	    { c = ca && cc && [];
	      for (j = k.length; j--; )
		prat(j);
	    }
	    prost();
	  }
	  switch (j = n.tagName)
	  { case "SET":
	      if (e = gatt("var")||gatt("variable"))
	      { if (k = pexpr(n))
		{ if (gatt("expr") != null)
		    k = k($);
		} else
		  switch ((k = eparse(n)).childNodes.length)
		  { case 0: k = "";
		      break;
		    case 1:
		      if ((j = k.firstChild).nodeType == 3)
			k = j.nodeValue;
		  }
		{ let s = gatt("split");
		  if (j = pregx())
		    k = dfnone(k), k = s != null ? k.split(j) : k.match(j);
		  else if (s != null)
		    k = dfnone(k).split(s);
		}
		if ((j = gatt("join")) != null)
		  k = k.join(j);
		if (gatt("json") != null)
		  k = JSON.parse(dfnone(k));
		fvar(e, $, k);
	      } else if (e = gatt("tag"))
	      { if (!isa(k = gatt("args") || []))
		  k = k.split(/\s*,\s*/);
		$._._tag[e.toUpperCase()] = [getdf(n),
		 gatt("scope"), gatt("noparse") == null,
		 k.reduce(function(a,i) { a[i] = 1; return a; }, {})];
	      }
	      continue drop;
	    case "ELIF":
	      if ($._._ok)
		continue drop;
	    case "IF":
	      e = pexpr(); $._._ok = e && e($);
	    case "THEN":
	      if (!$._._ok || pret())
		continue drop;
	      break;
	    case "ELSE":
	      if ($._._ok || pret())
		continue drop;
	      break;
	    case "FOR":
	    { let i = 0, res = D.createDocumentFragment(),
	       sc = gatt("scope");
	      function forloop()
	      { let t = {_index: j, _recno: ++i};
		if (e)
		  t = O.assign(t, t._value = e[j]);
		res.appendChild(newctx([n, sc], t)); $._._ok = 1;
	      }
	      $._._ok = 0;
	      if (j = gatt("in"))
		if ((e = fvar(j, $)) && e.length >= 0)
		  while ((j = i) < e.length)
		    forloop();
		else
		  if (j = gatt("orderby"))
		  { let ord = jsfunc(""
		      + function desc(i)
		  { return -(-i) === i ? -i : [i, 1];
		  } + "return[" + j + "];"), keys = O.keys(e);
		    keys.sort(function(a, b)
		    { var x, y, i, n, ret, r;
		      x = ord(e[a], $); y = ord(e[b], $);
		      for (i = 0, n = x.length; i < n; i++)
		      { r = 0;
			if (isa(x[i]))
			  r = 1, x[i] = x[i][0], y[i] = y[i][0];
			if (ret = x[i] > y[i] || -(x[i] != y[i]))
			  return r ? -ret : ret;
		      }
		      return r ? -ret : ret;
		    });
		    while (i < keys.length)
		      j = keys[i], forloop();
		  } else
		    for (j in e)
		      forloop();
	      else
	      { let step, to = +gatt("to");
		step = +gatt("step") || 1;
		for (j = +gatt("from"); step > 0 ? j <= to : to <= j; j += step)
		  forloop();
	      }
	      if (repltag(res))
		continue drop;
	      break;
	    }
	    case "DELIMITER":
	      if ($._._recno < 2 || pret())
		continue drop;
	      break;
	    case "INSERT":
	      if (e = gatt("var")||gatt("variable"))
	      { $._._ok = 1;
		e = insert(e, gatt("quote") || "", gatt("format"), $);
		if ((j = +gatt("offset")) || (k = gatt("limit")) != null)
		  e = dfnone(e).substr(j, +k);
		if (ret(e))
		  continue drop;
		break;
	      }
	      switch (gatt("variables"))
	      { case "dump":
		  if (ret(JSON.stringify((e = gatt("scope")) ? $[e] : $)))
		    continue drop;
		  break keep;
	      }
	      continue drop;
	    case "REPLACE":
	      if (ret(dfnone(eparse(n)).replace((k = pregx())
		  ? RegExp(k, (e = gatt("flags")) == null ? "g" : e)
		  : gatt("from"), pexpr() || gatt("to"))))
		continue drop;
	      break;
	    case "TRIM":
	      if (repltag(btrim(eparse(n))))
		continue drop;
	      break;
	    case "MAKETAG":
	      e = eparse(k = n); replelm(n = newel(gattr(k, "name")), k);
	      while((j = e.firstElementChild) && j.tagName == "ATTRIB")
	      { sattr(n, gattr(j, "name"), j.innerHTML);
		e.removeChild(j);
	      }
	      n.appendChild(e);
	      break;
	    case "EVAL":
	      j = (j = gatt("recurse")) == null ? 0 : j === "" ? j : +j;
	      for (k = "", e = n; j === "" || j-- >= 0; e = txt2node(k = e))
		if ((e = dfnone(eparse(e))) == k)
		  j = -1;
	      parse(e, $);
	      if (repltag(e))
		continue drop;
	      break;
	    case "NOPARSE":
	      if (repltag(getdf(n)))
		continue drop;
	      break;
	    case "NOOUTPUT":
	      eparse(n);
	    case "COMMENT":
	      continue drop;
	    default:
	      if (k = $._._tag[j])
	      { if (repltag(newctx(k, 0, n)))
		  continue drop;
	      } else if (n.firstElementChild)	// Avoid unnecessary recursion
	      { if (parse(n, $))		// Parse unnecessary?
		  cp(-1);
	      }
	      else if (n.firstChild && (k = n.textContent).length > 4
		    && k.indexOf("&") >= 0)
	      { if ((e = replent(k, $)).nodeType)
		  if (e.childNodes.length == 1 && e.firstChild.nodeType == 3)
		    e = e.firstChild.nodeValue;
		  else
		  { n.textContent = ""; n.appendChild(e);
		    break;
		  }
		if (e != k)
		  n.textContent = e;
		else
		  cp(-1);
	      } else
		  cp(-1);
	      break;
	    case undefined:		// Leave comment nodes untouched
	      if (n.nodeType != 8 && (k = n.nodeValue).length > 4
		&& k.indexOf("&") >= 0)
	      { if ((e = replent(n.nodeValue, $)).nodeType)
		{ rt = 1;
		  if (e.childNodes.length == 1 && e.firstChild.nodeType == 3)
		    e = e.firstChild.nodeValue;
		  else if (repltag(e))
		    continue drop;
		  else
		    break;
		}
		if (e != n.nodeValue)
		  n.nodeValue = e, rt = 1;
	      }
	  }
	} while(0);
	if (c)
	  cc[ca] = c;
	n = n.nextSibling;
	continue next;
      } while (0);
      if (c)
	cc[ca] = c;
      k = n; n = n.nextSibling; k.parentNode.removeChild(k);
    }
    if (!cc)
      return;
    if (!rt)
    { j = 1;
      for (n in cc)
	if (($ = cc[n]).length != 1 || $[0] >= 0)
	{ j = 0;
	  break;
	}
      if (j)
	return 1;
    }
    for (n in cc)
      bref[n].push(cc[n]);
    return 0;
  }

  function initctx($)
  { if (!$)
      $ = {};
    if (!$._)
      $._ = {};
    if (!$._._tag)
      $._._tag = {};
    if (!$.var)
      $.var = $.__;
    return $;
  }

  if (!O.assign)
    O.defineProperty(O, "assign",
    { value: function(d, s, i) { for (i in s) d[i] = s[i]; return d; } });

  if ("ab".substr(-1) != "b")
  { let p = String.prototype, s = p.substr;
    p.substr
     = function(a, n) { return s.call(this, a < 0 ? this.length + a : a, n); };
  }

  if (!String.prototype.trimStart)
  { String.prototype.trimStart = function ()
    { return this.replace(/^\s+/, ''); };
    String.prototype.trimEnd = function () { return this.replace(/\s+$/, ''); };
  }

  var fcache = {}, rcache = {}, txta = newel("textarea"), diva = newel("div"),
   diacr = {}, bref, g =
  { preparse: function(tpl, $)
      { var c, i, k;
	if (c = tpl)
	{ bref = [0]; c = c.querySelectorAll("*");
	  for (i = 0; i < c.length; i++)
	    sattr((k = c[i]), ":", i + 1), bref.push([k]);
	  k = parse(c = tpl.cloneNode(1), initctx($));
	  while (i = bref.pop())
	    if (i[1])
	      sattr(i[0], ":", JSON.stringify(i[1]));
	    else
	      rattr(i[0], ":");
	  bref = 0;
	  if (k)
	    if (tpl.nodeType == 1)
	      sattr(tpl, ":", "[-1]");
	    else
	      (k = newel("noparse")).appendChild(tpl).appendChild(k);
	}
	return c;
      },
    parse: function(tpl, $)
      { if (tpl)
	  tpl = txt2node(tpl), parse(tpl, initctx($));
	return tpl;
      },
    parse2txt: function(tpl, $) { return dfnone(g.parse(tpl, $)); },
    parse_tagged: function(tpl, $)
      { var i, j = (tpl = txt2node(tpl)).querySelectorAll("remixml"), k;
	$ = initctx($);
	for (i = 0; i < j.length; i++)
	  parse(k = getdf(j[i]), $), replelm(k, j[i]);
	return tpl;
      },
    parse_document: function($) { return g.parse(D.head.parentNode, $); },
    dom2txt: function(tpl) { return dfnone(tpl); },
    txt2dom: function(tpl) { return txt2node(tpl); },
    trim: function(tpl) { return btrim(txt2node(tpl)); },
    path_encode: encpath
  };

  { let i, j, p, fm = { "a":[53980,1941,1561,-10,7,153,7089,41,36,2,6,26,2,17,
	201,-1,28,2,1,1,1,127,97],"aa":[42803],"ae":[26,253,2,228],"ao":[42805],
	"au":[42807],"av":[2,42809],"ay":[42813],"b":[55921,1738,-1,7088,208,3,
	286,98],"c":[22532,33389,846,891,7117,180,123,-2,32,132,99],"d":[22474,
	33447,1728,-3,7092,1,202,123,2,171,100],"dz":[45,454],"e":[55921,1549,
	-6,156,-3,7098,20,30,34,2,40,194,-3,40,1,1,1,131,101],"f":[22474,33447,
	1718,7309,300,102],"g":[22438,34,33449,1717,168,6937,107,14,2,194,-2,
	182,103],"h":[53970,14,1937,1601,107,-3,7102,70,248,2,189,104],
	"hv":[405],"i":[55921,1549,2,154,2,7109,93,2,57,159,-3,58,1,1,1,131,
	105],"j":[55921,8848,89,187,203,106],"k":[22440,94,-1,31447,1936,1701,
	-1,7240,80,98,204,107],"l":[22475,56,2,31462,1926,1694,-2,7116,209,27,
	61,-3,206,108],"lj":[457],"m":[55921,1689,-1,7118,2,514,109],"n":[22441,
	20,33460,1682,-2,7123,121,91,85,1,-1,83,131,110],"nj":[460],"o":[22530,
	2,33389,1531,-10,122,-2,7128,33,35,-2,28,2,14,18,2,25,49,80,-1,85,3,1,
	1,1,131,111],"oe":[93,246],"oi":[419],"oo":[42831],"ou":[547],
	"p":[22523,-1,33394,1672,2,216,7128,309,112],"q":[22520,2,33399,8853,
	474,113],"r":[22443,36,40,33402,1666,-2,7132,48,58,2,184,-1,227,114],
	"s":[22442,36,33443,1607,50,-3,7202,38,184,-2,232,115],"ss":[223],
	"t":[22477,31521,1923,1612,38,-2,7139,109,110,70,-1,239,116],
	"tz":[42793],"u":[55921,1523,-5,106,-3,7146,114,2,57,-3,36,61,-4,110,1,
	1,132,117],"ue":[252],"v":[22519,33402,1638,2,7153,1,533,118],
	"vy":[42849],"w":[53988,1933,1614,15,-3,7436,254,119],"x":[55921,1626,
	2,7699,120],"y":[55921,1513,6,-2,90,10,7232,28,127,61,120,2,132,121],
	"z":[22519,31479,1923,1620,-1,7249,27,111,56,-1,256,122] };
    for (i in fm)
      for (p = 0; j = fm[i].pop(); diacr[String.fromCharCode(p += j)] = i)
	if (j < 0)
	{ while (j++ < 0)
	    fm[i].push(2);
	  j++;
	}
  }

  W.Remixml = g; W.define && define.amd && define([], g);
  if (W.exports)
    W.exports.Remixml = g, W.exports.document = D;

}(typeof window == "object" ? window : global,
  typeof document == "object" ? document : require("minidom")(''), Object);
