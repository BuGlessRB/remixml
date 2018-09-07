   // RemixML v1.0: XML/HTML-like macro language
  // Copyright (c) 2018 by Stephen R. van den Berg <srb@cuci.nl>
 // License: ISC OR GPL-3.0
// Sponsored by: Cubic Circle, The Netherlands

!function(W, D, O)
{ "use strict";
  var al = /[&<]/;

  function isstring(s)
  { return O.prototype.toString.call(s) === "[object String]";
  }

  function eumap(s)
  { return {"+":"%2B"," ":"+","?":"%3F","&":"%26","#":"%23"}[s];
  }

  W.sizeof = function(s)
  { return s ? s.nodeType ? dfnone(s).length : s.length || O.keys(s).length : 0;
  }

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
	      j = j.substr(0, p)
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
	case "path":
	  j = j.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          break;
	default: j = D.createTextNode(j);
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
	  if (j.nodeType)
	  { if (!s.lastChild)
	      s = txt2node(s);
	    s.appendChild(j); j = "";
	  }
	  if (j += i.shift())
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

  function newel(n) { return D.createElement(n); }

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
    j = newel("textarea");
    switch (n.nodeType)
    { case 11: j.appendChild(n); n = j;
      default: n = n.innerHTML;
      case undefined:
    }
    j.innerHTML = n;
    return j.value;
  }

  function replelm(n, o) { return o.parentNode.replaceChild(n, o); }
  function gattr(n, k) { return n.getAttribute(k); }

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

  function parse(tpl, $)
  { function eparse(n) { return parse(getdf(n), $); }
    var j, n = tpl.firstChild;
next:
    while (n)
    { let k, e;
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
      { let o$ = $, at;
	if (e)
	  at = e.attributes, e = eparse(e);
	($ = O.assign({}, $))._ = {_:$._, _tag:O.assign({}, $._._tag)};
	if (k[1])
	  $[k[1]] = $._;
	if (e)
	{ $._._contents = e;
	  for (e = at.length; e--; $._[at[e].name] = at[e].value);
	}
	if (j)
	  O.assign($._, j);
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
      function ret(e)
      { return repltag(txt2node(e));
      }
      do
      { if (k = n.attributes)
	  for (j = k.length; j--; )
	  { let i, s;
	    if ((e = replent(s = (i = k[j]).value, $)).nodeType)
	      e = dfnone(e);
	    if (s != e)
	      i.value = e;
	  }
	if (k = $._._tag[j = n.tagName])
	{ if (repltag(newctx(k, 0, n)))
	    continue;
	} else
keep:     switch (j)
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
		$._._tag[e.toUpperCase()] = [getdf(n), gatt("scope")];
	      continue;
	    case "ELIF":
	      if ($._._ok)
		continue;
	    case "IF":
	      e = pexpr(); $._._ok = e && e($);
	    case "THEN":
	      if (!$._._ok || repltag(eparse(n)))
		continue;
	      break;
	    case "ELSE":
	      if ($._._ok || repltag(eparse(n)))
		continue;
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
			if (Array.isArray(x[i]))
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
		continue;
	      break;
	    }
	    case "DELIMITER":
	      if ($._._recno < 2 || repltag(eparse(n)))
		continue;
	      break;
	    case "INSERT":
	      if (e = gatt("var")||gat("variable"))
	      { $._._ok = 1; e = insert(e, gatt("quote"), gatt("format"), $);
		if ((j = +gatt("offset")) || (k = gatt("limit")) != null)
		  e = dfnone(e).substr(j, +k);
		if (ret(e))
		  continue;
		break;
	      }
	      switch (gatt("variables"))
	      { case "dump":
		  if (ret(JSON.stringify((e = gatt("scope")) ? $[e] : $)))
		    continue;
		  break keep;
	      }
	      continue;
	    case "REPLACE":
	      if (ret(dfnone(eparse(n)).replace((k = pregx())
			? RegExp(k, (e = gatt("flags")) == null ? "g" : e)
			: gatt("from"),         pexpr() || gatt("to"))))
		continue;
	      break;
	    case "TRIM":
	      if (repltag(btrim(eparse(n))))
		continue;
	      break;
	    case "MAKETAG":
	      e = eparse(k = n); replelm(n = newel(gattr(k, "name")), k);
	      while((j = e.firstElementChild) && j.tagName == "ATTRIB")
	      { n.setAttribute(gattr(j, "name"), j.innerHTML);
		e.removeChild(j);
	      }
	      n.appendChild(e);
	      break;
	    case "EVAL":
	      j = (j = gatt("recurse")) == null ? 0 : j == "" ? j : +j;
	      for (k = "", e = n; j == "" || j-- >= 0; e = txt2node(k = e))
		if ((e = dfnone(eparse(e))) == k)
		  j = -1;
	      if (repltag(parse(e, $)))
		continue;
	      break;
	    case "NOPARSE":
	      if (repltag(getdf(n)))
		continue;
	      break;
	    case "NOOUTPUT":
	      eparse(n);
	    case "COMMENT":
	      continue;
	    default:
	      if (n.firstChild)		// Avoid unnecessary recursion
		parse(n, $);
	      break;
	    case undefined:
	      if (n.nodeType != 8)	// Leave comment nodes untouched
	      { if ((e = replent(n.nodeValue, $)).nodeType)
		  if (e.childNodes.length == 1 && e.firstChild.nodeType == 3)
		    e = e.firstChild.nodeValue;
		  else if (repltag(e))
		    continue;
		  else
		    break;
		if (e != n.nodeValue)
		  n.nodeValue = e;
	      }
	  }
	n = n.nextSibling;
	continue next;
      } while (0);
      k = n; n = n.nextSibling; k.parentNode.removeChild(k);
    }
    return tpl;
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

  function txt2node(t)
  { return t.nodeType ? t : D.createRange().createContextualFragment(t);
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

  var fcache = {}, rcache = {}, g =
  { parse: function(tpl, $)
      { if (tpl)
	  tpl = txt2node(tpl), parse(tpl, initctx($));
	return tpl;
      },
    parse2txt: function(tpl, $) { return dfnone(g.parse(tpl, $)); },
    parse_tagged: function(tpl, $)
      { var i, j = (tpl = txt2node(tpl)).querySelectorAll("remixml");
	$ = initctx($);
	for (i = 0; i < j.length; i++)
	  replelm(parse(getdf(j[i]), $), j[i]);
	return tpl;
      },
    parse_document: function($) { return g.parse(D.head.parentNode, $); },
    dom2txt: function(tpl) { return dfnone(tpl); },
    trim: function(tpl) { return btrim(txt2node(tpl)); }
  };

  W.Remixml = g; W.define && define.amd && define(g);
  if (W.exports)
    W.exports.Remixml = g, W.exports.document = D;

}(typeof window == "object" ? window : global,
  typeof document == "object" ? document : require("minidom")(''), Object);
