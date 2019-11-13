   /** @license
   ** Remixml v1.8.14: XML/HTML-like macro language
  ** Copyright (c) 2018-2019 by Stephen R. van den Berg <srb@cuci.nl>
 ** License: ISC OR GPL-3.0
** Sponsored by: Cubic Circle, The Netherlands
*/

/** @define {number} */ var DEBUG = 0;

(function(W, D, O)
{ "use strict";
  const /** Object */ al = /[&<]/, splc = /\s*,\s*/;
  const /** Object */ fcache = {}, rcache = {}, diacr = {};
  const /** string */ ctn = "_contents";
  const /** Node */ txta = newel("textarea"), diva = newel("div");
  var /** function(...) */ log = console.log;

  // For preparse state, not re-entry-safe
  var /** Object<string,Array> */ bref;

  function /** !boolean */ isstring(/** * */ s)
  { return O.prototype.toString.call(s) === "[object String]"; }

  function /** string */ eumap(/** string */ s)
  { return {"+":"%2B"," ":"+","?":"%3F","&":"%26","#":"%23"}[s]; }

  function udate(t) { return t.valueOf() - t.getTimezoneOffset * 60000; }
  function /** !Node */ replelm(/** !Node */ n, /** !Node */ o)
  { return o.parentNode.replaceChild(n, o);
  }

  function /** string */ gattr(/** !Node */ n, /** string */ k)
  { return n.getAttribute(k);
  }

  function sattr(n, k, v) { n.setAttribute(k, v); }

  function /** !Node */ newel(/** string */ n)
  { return D.createElement(n);
  }

  function rattr(/** !Node */ n, /** string */ k) { n.removeAttribute(k); }

  function /** !boolean */ isa(/** * */ s) { return Array.isArray(s); }

  function /** string */ pad0(/** number */ i, /** number */ p)
  { var /** string */ ret;
    for (i < 0 && p--, ret = i + ""; ret.length < p; ret = "0" + ret) {}
    return ret;
  }

  function /** string */
   strftime(/** string */ fmt, /** !Date|string */ d, /** string */ lang)
  { var t, j1, ut;
    if (!(d instanceof Date))
    { t = d.match && /[A-Za-z]/.test(d);
      d = new Date(d);
      if (t)
	d = new Date(2 * d.valueOf() - udate(t));	// Adjust to localtime
    }
    var dy = d.getDay(), md = d.getDate(), m = d.getMonth(),
     y = d.getFullYear(), h = d.getHours(), h24 = 86400000;
    function /** string */ ifm(/** string= */ t, /** string= */ f)
    { var o = {};
      o[t || "weekday"] = f || "short";
      return new Intl.DateTimeFormat(lang, o)
	.format(/** @type {!Date|number|undefined} */(d));
    }
    function thu()
    { var t = new Date(d);
      t.setDate(md - ((dy + 6) % 7) + 3);
      return t;
    }
    return fmt.replace(/%([A-Za-z%])/g, function(a, p)
    { switch(p)
      { case "a": return ifm();
	case "A": return ifm(undefined, "long");
	case "b": return ifm("month");
	case "B": return ifm("month", "long");
	case "G": return thu().getFullYear();
	case "g": return (thu().getFullYear() + "").slice(2);
	case "k": return h;
	case "n": return m + 1;
	case "e": return md;
	case "d": return pad0(md, 2);
	case "H": return pad0(h, 2);
	case "j": return pad0(Math.floor((udate(d) - udate(Date(y))) / h24) + 1,
				3);
	case "C": return Math.floor(y / 100);
	case "s": return Math.round(d.valueOf() / 1000);
	case "l": return (h + 11) % 12 + 1;
	case "I": return pad0((h + 11) % 12 + 1, 2);
	case "m": return pad0(m + 1, 2);
	case "M": return pad0(d.getMinutes(), 2);
	case "S": return pad0(d.getSeconds(), 2);
	case "p": return h<12 ? "AM" : "PM";
	case "P": return h<12 ? "am" : "pm";
	case "%": return "%";
	case "R": return strftime("%H:%M", d, lang);
	case "T": return strftime("%H:%M:%S", d, lang);
	case "V":
	  t = thu(); ut = t.valueOf(); t.setMonth(0, 1);
	  if ((j1 = t.getDay()) != 4)
	    t.setMonth(0, 1 + (11 - j1) % 7);
	  return pad0(1 + Math.ceil((ut - t) / (h24 * 7)), 2);
	case "u": return dy || 7;
	case "w": return dy;
	case "Y": return y;
	case "y": return (y + "").slice(2);
	case "F": return d.toISOString().slice(0, 10);
	case "c": return d.toUTCString();
	case "x": return d.toLocaleDateString();
	case "X": return d.toLocaleTimeString();
	case "z": return d.toTimeString().match(/.+GMT([+-]\d+).+/)[1];
	case "Z": return d.toTimeString().match(/.+\((.+?)\)$/)[1];
      }
      return a;
    });
  }

  function /** !Node */ getdf(/** !Node */ n)
  { if (n.nodeType == 11)
      return n;
    var /** Range */ k = D.createRange();
    k.selectNodeContents(n);
    return /** @type {!Node} */(k.extractContents());
  }

  function /** string */ dfhtml(/** !Node */ n)
  { var /** Node */ k = newel("div"); k.appendChild(n); return k.innerHTML; }

  function /** string */ dfnone(/** Node|string */ n)
  { var /** Node */ j;
nostr:
    switch (/** @type {number|undefined} */(n.nodeType))
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
	let /** number */ i;
	if ((i = n.indexOf("&")) < 0 || n.indexOf(";", i + 2) < 0)
	  return /** @type {string} */(n);
    }
    j = txta;
    switch (/** @type {number|undefined} */(n.nodeType))
    { case 11: j.appendChild(/** @type {Node} */(n)); n = j;
      default: n = n.innerHTML;
      case undefined:;
    }
    j.innerHTML = n; n = j.value; j.textContent = "";
    return /** @type {string} */(n);
  }

  function /** !Node */ txt2node(/** string|Node */ t)
  { if (!t.nodeType)
    { diva.innerHTML = t; t = getdf(diva);
      if (t.nodeType == 11 && t.childNodes.length == 1)
	t = t.childNodes[0];
    }
    return /** @type {!Node} */(t);
  }

  W["sizeof"] = function /** number */(/** * */ s)
  { return Number(s) === s ? 1
     : s ? s.nodeType ? dfnone(/** @type {!Node|string} */(s)).length
     : s.length || O.keys(/** @type {!Object} */(s)).length : 0;
  };

  function /** * */ fvar(/** string */ s, /** !Object */ $, /** *= */ val)
  { var /** string */ i;
    var /** Object */ j;
    var /** Array<string> */ a;
    i = (a = s.split(/[.[\]]+/)).shift();
    if (val === undefined)
    { val = $[i];
      do
      { if (!val)
	  break;
	i = a.shift() + "";
	val = val.nodeType ? val = i == ctn
	  ? getdf(val) : gattr(val, i) : val[i];
      } while (a.length);
      return val;
    }
    do
    { if (!(j = $[i]))
	$[i] = j = {};
      $ = j; i = a.shift();
    } while (a.length);
    if (val == null)
      delete $[i];
    else
      $[i] = val;
  }

  function /** string */ encpath(/** string */ s)
  { return s.toLowerCase()
		.replace(/[^\0-~]/g, function(a) { return diacr[a] || a; })
		.replace(/(?:&(?:[^&;\s]*;)?|[^&a-z0-9])+/g, "-")
		.replace(/^-|[\u0300-\u036f]|-$/g, "");
  }

  function /** string */ sp(/** string */ j, /** string */ s)
  { if (j[0] == "0")
      j[0] = s;
    else
      j = s + j;
    return j;
  }

  function /** string */
   fmtf(/** number */ k, /** string */ s, /** number */  d)
  { var /** string */ t
     = /** @type {function(string=, Object=):string} */(k.toLocaleString)(s,
	{"minimumFractionDigits": d, "maximumFractionDigits": d});
    if (t == k)
    { s = "";
      if (k < 0)
	s = "-", k = -k;
      t = Math.round(k * Math.pow(10, d)) + "";
      while (t.length <= d)
	t = "0" + t;
      d = t.length - d; t = s + t.substr(0, d) + "." + t.substr(d);
    }
    return t;
  }

  function /** string */
   fmtcur(/** number */ k, /** string */ lang, /** string */ cur)
  { var /** string */ t
     = /** @type {function(string=, Object=):string} */(k.toLocaleString)(lang,
        {"style":"currency", "currency":cur});
    if (t == k)
      t = ({"EUR":"\u20AC", "USD":"$", "CNY":"\u00A5"}[cur] || cur)
	+ fmtf(k, lang, 2);
    t = t.match(/([^-0-9\s]+)\s*([-0-9].*)/);
    return t[1] + "&nbsp;" + t[2];
  }

  function /** string|!Array{string} */ insert(/** string */ k,
    /** string */ quot, /** string */ fmt, /** !Object */ $)
  { var /** * */ j;
    if ((j = fvar(k, $)) != null)
    { if (j.nodeType)
      { j = j.cloneNode(true);
	switch (quot)
	{ case "none":case "":case "recurse":case "r":
	    if (!fmt)
	      break;
	  default: j = dfhtml(j);
	}
      } else if (- - /** @type {string|number} */(j) == j)
	/** @type {number} */(j) += "";
      else if (typeof j == "function")
	j = j($["_"], $);
      if (fmt && isstring(j))
      { let /** Array<string> */ r = fmt.match(
/^([-+0]+)?([1-9][0-9]*)?(?:\.([0-9]+))?(t([^%]*%.+)|[a-zA-Z]|[A-Z]{3})?$/);
	var p = r[3], lang = $["sys"] && $["sys"]["lang"] || undefined;
	switch (r[4])
	{ case "c": j = String.fromCharCode(+j); break;
	  case "d": j = parseInt(j, 10).toLocaleString(); break;
	  case "e":
	    j = /** @type {function((null|string)):string} */
	     ((+j).toExponential)(p > "" ? p : null);
	    break;
	  case "f":
	    if (!(p > ""))
	      p = 6;
	    j = fmtf(+j, lang, /** @type {number} */(p));
	    break;
	  case "g": j = /** @type {function((number|string)):string} */
	     ((+j).toPrecision)(p > "" ? p : 6); break;
	  case "x": j = (parseInt(j, 10) >>> 0).toString(16); break;
	  case "s":
	    if (p > "")
	      j = j.substr(0, p);
	    break;
	  default:
	    j = r[4][0] == "t"
	        ? strftime(r[5], /** @type {string} */(j), lang)
		: /[A-Z]{3}/.test(r[4]) ? fmtcur(+j, lang, r[4]) : j;
	}
	if (r[1])
	{ if (r[1].indexOf("0") >= 0 && (p = +r[2]))
	    j = +j < 0 ? sp(pad0(- /** @type {number} */(j), p), "-")
	               : pad0(/** @type {number} */(j), p);
	  if (r[1].indexOf("+") >= 0 && +j >= 0)
	    j = sp(/** @type {string} */(j), "+");
	}
      }
      switch (quot)
      { case "json": j = JSON.stringify(j).replace(/</g, "\\u003c"); break;
	case "uric": j = j.replace(/[+ ?&#]/g, eumap); break;
	case "path": j = encpath(/** @type {string} */(j)); break;
	default:
	  if (isstring(j))
	    j = D.createTextNode(j);
	case "none": case "":case "recurse": case "r":;
      }
      $["_"]["_ok"] = 1;
    } else
      $["_"]["_ok"] = 0, j = "";
    return /** @type {string} */(j);
  }

  function /** string|!Node|!Array<string> */
   replent(/** string */ s, /** !Object */ $)
  { function /** string|!Node|!Array<string> */
     r(/** string|!Node|!Array<string> */ s)
    { var /** string */ c;
      var /** string|!Node|!Array<string> */ j;
      var /** Array<string> */ i;
      if (s.nodeType)
      { let /** Node */ h;
	if (h = s.firstChild)
	{ let /** string|!Node|!Array<string> */ k;
	  do
	    if ((k = r(h)) != h)
	      if (k.nodeType)
		s.replaceChild(/** @type {Node} */(k), h = k.lastChild || h);
	      else
		h.nodeValue = k;
	  while(h = h.nextChild);
	  return s;
	}
	s = s.nodeValue;
      }
      if ((i = s.split(
	   /&([\w$]+(?:[.[][\w$]+]?)*\.[\w$]+)(?::([\w$]*))?(?:%([^;]*))?;/))
       .length > 1)
      { s = i.shift();
	do
	{ j = i.shift();
	  c = i.shift(); j = insert(j, c, i.shift(), $);
	  switch (c)
	  { case "recurse":case "r":
	      j = r(j);
	  }
	  c = i.shift();
	  if (!isstring(j))
	  { if (j.nodeType)
	    { if (!s.lastChild)
		s = txt2node(/** @type {string} */(s));
	      s.appendChild(/** @type {Node} */(j)); j = "";
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
	  { s.push(/** @type {string} */(j));
	    if (c)
	      s.push(/** @type {string} */(j));
	  } else if (j = j + c)
	    if (c = s.lastChild)
	      if (c.nodeType == 3 && !al.test(j))
		c.nodeValue += j;
	      else
		s.appendChild(txt2node(j));
	    else if (al.test(j))
	      s = txt2node(s + j);
	    else
	      s += j;
	} while (i.length);
      }
      return s;
    }
    return r(s);
  }

  function logerr(t, x)
  { log("Remixml expression: " + JSON.stringify(t) + "\n" + x);
  }

  function trim(/** !Node */ s)
  { var n = s.firstChild, i;
    if (n)
      do
      { i = n.nextChild;
	if (n.nodeType == 8)		// Strip comment nodes
	  s.removeChild(n);
	else
	  trim(n);
      } while (n = i);
    else if (s.nodeValue)
      s.nodeValue = s.nodeValue.replace(/\s\s+/g,' ');
  }

  function /** !Node */ btrim(/** !Node */ e)
  { var k;
    e.normalize(); trim(e);
    if ((k = e.firstChild) && k.nodeType == 3)
      k.nodeValue = k.nodeValue.trimStart();
    if ((k = e.lastChild) && k.nodeType == 3)
      k.nodeValue = k.nodeValue.trimEnd();
    return e;
  }

  function settag(/** !Node|function(...):(string|!Node) */ tpl,
   /** !Object */ $,/** string */ name,/** string|number= */ scope,
   /** boolean|number= */ noparse,/** string= */ args)
  { $["_"]["_tag"][name.toUpperCase()] = [tpl, scope, noparse,
     (args ? args.split(splc) : [])
      .reduce(function(a,i) { a[i] = 1; return a; }, {})];
  }

  function /** number|undefined */ parse(/** Node */ n,/** !Object */ $)
  { var j, rt, cc = bref && {}, k, e, c, ca, x, i, res, mkm, sc, to;
    function /** !Node */ eparse(/** !Node */ n)
    { var /** Node */ k; parse(k = getdf(n), $); return k;
    }
    function /** string */ gatt(/** string */ k)
    { return gattr(/** @type {!Node} */(n), k);
    }
    function /** function(!Object):* */ jsfunc(/** string */ j)
    { var e;
      if (!(e = fcache[j]))
        try
        { e = Function("$", "$$", '"use strict";var _=$._;' + j);
	  if (!gatt("nojscache"))
            fcache[j] = e;
	} catch(x) { logerr(j, x); }
      return e;
    }
    function run(k)
    { try { return k($); } catch(x) { logerr(gatt("expr"), x); }
    }
    function repltag(e)
    { var j;
      var /** Node */ t;
      if (j = e.lastChild)
	t = /** @type {!Node} */(n), n = j, replelm(e, t);
      else if (j = e.nodeValue)
	replelm(e, /** @type {!Node} */(n)), n = e;
      return !j;
    }
    function /** Node */
     newctx(/** !Array */ k, /** Object */ j, /** Node= */ e)
    { var o$ = $, at, _, i, v, r;
      if (e)
      { at = e.attributes;
	if (!k[2])		// !noparse
	  e = eparse(e);
      }
      ($ = O.assign({}, $))["_"]
	= _ = {"_":$["_"], "_tag":O.assign({}, $["_"]["_tag"])};
      if (k[1])
	$[k[1]] = _;
      if (e)
      { let /** Node|string */ cn = e;
	if (e.nodeType != 11)
	  cn = getdf(e);
	else if (!e.childElementCount)
	  switch (e.childNodes.length)
	  { case 0:
	      cn = "";
	      break;
	    case 1:
	      cn = e.firstChild.nodeValue;
	  }
	_[ctn] = cn; _["_restargs"] = r = {};
	for (i = at.length; i--; )
	{ let /** string */ ts;
	  v = _[ts = at[i].name] = at[i].value;
	  if (!k[3][ts])       // args
	    r[ts] = v;
	}
      }
      if (j)
	O.assign(_, j);
      j = eparse((j = k[0]).nodeType ? j.cloneNode(true) : txt2node(j($)));
      ($ = o$)["_"] = o$["_"];
      return j;
    }
    function /** * */ pexpr(/** !Node=|string= */ c)
    { var /** string */ j;
      return (j = gatt("expr")) != null && (c || j)
	  && jsfunc(!j && c ? dfnone(c) : "return(" + dfnone(j) + ");");
    }
    function pregx()
    { var j;
      try
      { return (j = gatt("regexp")) != null
	  && (rcache[j] || (rcache[j] = RegExp(j)));
      } catch(x) { logerr(j, x); }
    }
    function ret(e) { return repltag(txt2node(e)); }
    function pret() { return repltag(eparse(/** @type {!Node} */(n))); }
    function cp(x) { c && c.push(x); }
    function prat(j)
    { var e, i = k[j], s = i.value;
      if (!c || s.length > 4 && s.indexOf("&") >= 0)
      { if ((e = replent(s, $)).nodeType)
	  e = dfnone(/** @type {!Node|string} */(e));
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
      { var j;
	rattr(/** @type {!Node} */(n), "::");
	for (j in x)
	  sattr(n, j, x[j]);
      }
    }
    function forloop()
    { var x, y, z, t = {"_index": j, "_recno": ++i};
      if (e) {
	y = e[j];
	if (!y && e.size)
	  y = e.get ? e.get(j) : j;
	if (mkm) {
	  z = {};
	  for (x = -1; ++x < y.length; z[mkm[x]] = y[x]) {}
	  y = z;
	}
	t = O.assign(t, t["_value"] = y);
      }
      res.appendChild(newctx([n, sc], t)); $["_"]["_ok"] = 1;
    }
    n = n.firstChild;
next:
    while (n) {
drop: do {
keep:   do
	{ c = 0;
	  if (k = n.attributes)
	  { x = 0;
	    if (ca = gatt(":c"))
	      rattr(/** @type {!Node} */(n), ":c");
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
	      { if (k = pexpr(/** @type {!Node} */(n)))
		  k = run(k);
		else
		  switch ((k = eparse(/** @type {!Node} */(n)))
		   .childNodes.length)
		  { case 0: k = "";
		      break;
		    case 1:
		      if ((j = k.firstChild).nodeType == 3)
			k = j.realvalue || j.nodeValue;
		  }
		if ((j = gatt("selector")) != null)
		  k = k.querySelectorAll(j);
		else
		{ if (gatt("json") != null)
		    k = JSON.parse(dfnone(k));
		  if ((j = gatt("mkmapping")) != null)
		  { j = j.split(/\s*,\s*/);
		    for (x = k, k = {}, i = -1; ++i < j.length;)
		      k[j[i]] = x[i];
		  } else
		  { x = gatt("split");
		    if (j = pregx()) {
		      k = dfnone(/** @type {!Node|string} */(k));
		      k = x != null ? k.split(j) : k.match(j);
		    } else if (x != null)
		      k = dfnone(/** @type {!Node|string} */(k)).split(x);
		    if ((j = gatt("join")) != null)
		      k = k.join(j);
		  }
		}
		fvar(e, $, k);
	      } else if (e = gatt("tag"))
		settag(getdf(/** @type {!Node} */(n)), $, e, gatt("scope"),
		 gatt("noparse") != null, gatt("args"));
	      continue drop;
	    case "UNSET":
	      if (e = gatt("var")||gatt("variable"))
		fvar(e, $, null);
	      continue drop;
	    case "ELIF":
	      if ($["_"]["_ok"])
		continue drop;
	    case "IF":
	      e = pexpr(); $["_"]["_ok"] = e && run(e);
	    case "THEN":
	      if (!$["_"]["_ok"] || pret())
		continue drop;
	      break;
	    case "ELSE":
	      if ($["_"]["_ok"] || pret())
		continue drop;
	      break;
	    case "FOR":
	    { i = 0; res = D.createDocumentFragment(); sc = gatt("scope");
	      $["_"]["_ok"] = 0;
	      if (j = gatt("in"))
	      { if (mkm = gatt("mkmapping"))
		  mkm = mkm.split(/\s*,\s*/);
	       	if ((e = fvar(j, $)) && e.length >= 0)
		  while ((j = i) < e.length)
		    forloop();
		else if (e.size >= 0)
		  for (j of e.keys())
		    forloop();
		else
		  if (j = gatt("orderby"))
		  { let /** function(!Object,(string|number)):* */ ord
		     = jsfunc("var _index=$$;" +
		     "function desc(i){return- -i===i?-i:[i,1];}return["
		      + j + "];");
		    try
		    { let old_ = $["_"];
		      (to = O.keys(/** @type {!Object}:* */(e)))
		       .sort(function(a, b)
		      { var x, y, i, n, r;
			var /** number */ ret;
			$["_"] = e[a]; x = ord($, a);
			$["_"] = e[b]; y = ord($, b);
			for (i = 0, n = x.length; i < n; i++)
			{ r = 0;
			  if (isa(x[i]))
			    r = 1, x[i] = x[i][0], y[i] = y[i][0];
			  if (ret = /** @type {number} */
			           (x[i] > y[i] || -(x[i] != y[i])))
			    return r ? -ret : ret;
			}
			return r ? -ret : ret;
		      });
		      $["_"] = old_;
		    } catch(x) { logerr(j, x); }
		    while (i < to.length)
		      j = to[i], forloop();
		  } else
		    for (j in e)
		      forloop();
	      } else
	      { let /** number */ step = +gatt("step") || 1;
		to = +gatt("to");
		for (j = +gatt("from");
		     step > 0 ? j <= to : to <= j;
		     j += step)
		  forloop();
	      }
	      if (repltag(res))
		continue drop;
	      break;
	    }
	    case "DELIMITER":
	      if ($["_"]["_recno"] < 2 || pret())
		continue drop;
	      break;
	    case "INSERT":
	      if (e = gatt("var")||gatt("variable"))
	      { $["_"]["_ok"] = 1;
		e = insert(e, gatt("quote") || "", gatt("format"), $);
		if ((j = +gatt("offset")) || (k = gatt("limit")) != null)
		  e = dfnone(/** @type {string} */(e)).substr(j, +k);
		if (isa(e) && (j = gatt("join")) != null)
		  e = /** @type {Array<string>} */(e).join(j);
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
	      try
	      { if (ret(dfnone(eparse(/** @type {!Node} */(n)))
		 .replace((k = pregx())
		    ? RegExp(k, (e = gatt("flags")) == null ? "g" : e)
		    : gatt("from"),
		   /** @type {string} */(pexpr()) || gatt("to"))))
		  continue drop;
	      } catch(x) { logerr(gatt("expr"), x); }
	      break;
	    case "TRIM":
	      if (repltag(btrim(eparse(/** @type {!Node} */(n)))))
		continue drop;
	      break;
	    case "MAKETAG":
	      e = eparse(k = n); n = newel(gattr(k, "name"));
	      for (j = e.firstChild; j; j = x)
	      { x = j.nextSibling;	// IE11 lacks nextElementSibling
		if (j.nodeType == 1)
		  if (j.tagName == "ATTRIB")
		    sattr(n, gattr(j, "name"), j.textContent), e.removeChild(j);
		  else
		    break;
	      }
	      e.normalize(); n.appendChild(e);
	      replelm(/** @type {!Node} */(n), k);
	      break;
	    case "SCRIPT":
	      e = (k = n).attributes; n = newel("SCRIPT");
	      for (j = -1; ++j < e.length; sattr(n, e[j].name, e[j].value)) {}
	      n.textContent = k.textContent;
	      replelm(/** @type {!Node} */(n), k);
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
	      if (repltag(getdf(/** @type {!Node} */(n))))
		continue drop;
	      break;
	    case "NOOUTPUT":
	      eparse(/** @type {!Node} */(n));
	    case "COMMENT":
	      continue drop;
	    default:
	      if (k = $["_"]["_tag"][j])
	      { if (repltag(newctx(k, null, n)))
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
		{ n.nodeValue = n.realvalue = /** @type {string} */(e);
		  rt = 1;
		}
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
    for (k in cc)
      bref[k].push(cc[k]);
    return 0;
  }

  function /** !Object */ initctx(/** !Object */ $)
  { if (!$)
      $ = {};
    if (!$["_"])
      $["_"] = {};
    if (!$["_"]["_tag"])
      $["_"]["_tag"] = {};
    if (!$["var"])
      $["var"] = $["__"];
    return $;
  }

  if (!O.assign)
    O.defineProperty(O, "assign",
    { "value": function(d, s, i)
      { if (s) for (i in s) d[i] = s[i]; return d;
      }
    });

  if ("ab".substr(-1) != "b")
    (function(p) {
      let s = p.substr;
      p.substr = function /** string */
                 (/** number */ a, /** number= */ n)
      { return s.call(this, a < 0 ? this.length + a : a, n); };
    })(String.prototype);

  if (!String.prototype.trimStart)
  { String.prototype.trimStart = function /** string */()
    { return this.replace(/^\s+/, ''); };
    String.prototype.trimEnd = function /** string */()
    { return this.replace(/\s+$/, ''); };
  }

  var g =
  { "preparse": function /** !Node */(/** !Node */ tpl, /** !Object */ $)
      { var /** Node */ c;
	if (c = tpl)
	{ let /** !NodeList<!Element> */ a;
	  let /** number */ i;
	  let /** Array */ b;
	  let k;
	  bref = [0]; a = c.querySelectorAll("*");
	  for (i = 0; i < a.length; i++)
	    sattr((k = a[i]), ":c", i + 1), bref.push([k]);
	  k = parse(c = tpl.cloneNode(true), initctx($));
	  while (b = bref.pop())
	    if (b[1])
	      sattr(b[0], ":c", JSON.stringify(b[1]));
	    else
	      rattr(b[0], ":c");
	  bref = null;
	  if (k)
	    if (tpl.nodeType == 1)
	      sattr(tpl, ":c", "[-1]");
	    else
	      (k = newel("noparse")).appendChild(tpl).appendChild(k);
	}
	return c;
      },
    "parse": function /** Node */(/** string|Node */ tpl, /** !Object */ $)
      { if (tpl)
	  tpl = txt2node(tpl), parse(tpl, initctx($));
	return tpl;
      },
    "parse2txt":
     function /** string */(/** string|Node */ tpl, /** !Object */ $)
     { return dfnone(g.parse(tpl, $));
     },
    "parse_tagged":
      function /** !Node */(/** string|Node */ tpl, /** !Object */ $)
      { var i, j = (tpl = txt2node(tpl)).querySelectorAll("remixml"), k;
	$ = initctx($);
	for (i = 0; i < j.length; i++)
	  parse(k = getdf(j[i]), $), replelm(k, j[i]);
	return tpl;
      },
    "parse_document": function /** !Node */(/** !Object */ $)
      { return /** @type {!Node} */(g.parse(D.head.parentNode, $));
      },
    "set_tag": function /** void */(/** function(...):(string|!Node) */ cb,
       /** !Object */ $,/** string */ name,/** string|number= */ scope,
       /** boolean|number= */ noparse,/** string= */ args)
      { settag(cb, initctx($), name, scope, noparse, args);
      },
    "dom2txt": function /** string */(/** string|Node */ tpl)
      { return dfnone(tpl);
      },
    "txt2dom": function /** !Node */(/** string|Node */ tpl)
      { return txt2node(tpl);
      },
    "trim": function /** !Node */(/** string|Node */ tpl)
      { return btrim(txt2node(tpl));
      },
    "path_encode": encpath,
    "set_log_callback": function /** void */(/** function(...) */ cb)
      { log = cb;
      }
  };

  (function(fm)
  { var i, j, p;
    for (i in fm)
      for (p = 0; j = fm[i].pop(); diacr[String.fromCharCode(p = p + j)] = i)
	if (j < 0)
	{ while (j++ < 0)
	    fm[i].push(2);
	  j++;
	}
  })({ "a":[53980,1941,1561,-10,7,153,7089,41,36,2,6,26,2,17,
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
	"z":[22519,31479,1923,1620,-1,7249,27,111,56,-1,256,122] });

  if (typeof define == "function" && define["amd"])
    define("remixml", [], g);
  else if (W["exports"])
    W["exports"]["Remixml"] = g, W["exports"]["document"] = D;
  else
    W["Remixml"] = g;
})(typeof window == "object" ? window : global,
  typeof document == "object" ? document : require("minidom")(''), Object);
