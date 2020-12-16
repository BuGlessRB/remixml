   /** @license
   ** Remixml v2.13.1: XML/HTML-like macro language compiler
  ** Copyright (c) 2018-2020 by Stephen R. van den Berg <srb@cuci.nl>
 ** License: ISC OR GPL-3.0
** Sponsored by: Cubic Circle, The Netherlands
*/

/** @define {number} */ var DEBUG = 1;
/** @define {number} */ var ALERTS = 0;
                            // error context length
/** @define {number} */ var RUNTIMEDEBUG = 64;
/** @define {number} */ var MEASUREMENT = 0;
/** @define {number} */ var ASSERT = 1;
/** @define {number} */ var VERBOSE = 0;

// Cut BEGIN delete
(function()
{ "use strict";
// Cut END delete

  // Cut BEGIN for externs
  // Cut BEGIN for prepend
  var VP,SP,CA,B,C,E,F,G,K,L,M,N,P,Q,R,S,T,U,V,X,Y,Z,
   log,sizeof,desc,abstract2txt,abstract2dom;
  // Cut END for prepend
  var A,VE,IA;
  // Cut END for externs
  // Cut BEGIN for prepend
  function A(_,$,v)
  {if(_&&!_.length&&_[""]===1)_="";return v?eval(VP(v)+"=_;"):_};
  function VE($,v){return eval(IA(v)?v[0]:VP(v))};
  function IA(s){return Array.isArray(s)}
  // Cut END for prepend

  const D = typeof document == "object" ? document : null;
  const W = D && window;
  const O = Object;
  const ie11 = D && W["MSInputMethodContext"] && D["documentMode"];

  const /** !RegExp */ splc = /\s*,\s*/g;
  const /** Object */ diacr = {}; // Full list of diacrite stripdown aliases
  const /** !Object */ elmcache = {};
  const /** string */ varinsert = "I=K($,H,x)}catch(x){I=0}";
  const /** string */ cfnprefix = "H._c=function(H,$){";
  const /** string */ letHprefix = "{let H=L(),";
  const /** string */ vfnprefix = "w,v=function(){w();";
  const /** !RegExp */ txtentity =
   /[^&]+|&(?:[\w$[\]:.]*(?=[^\w$.[\]:%;])|[\w]*;)|&([\w$]+(?:[.[][\w$]+]?)*\.[\w$]+)(?::([\w$]*))?(?:%([^;]*))?;/g;
  const /** !RegExp */ varentity = regexpy(
         "([\\w$]+\\.[\\w$]+(?:[.[][\\w$]+]?)*)(?::([\\w$]*))?(?:%([^;]*))?;");
  const /** !RegExp */ commentrx = regexpy("(--.*?--)>");
  const /** !RegExp */ doctyperx = regexpy("(.*?)>");
  const /** !RegExp */ textrx = regexpy("[^&<]+");
  const /** !RegExp */ params
   = /\s*(?:([-\w:]+|\/)\s*(?:=\s*("[^"]*"|'[^']*'))?|>)/g;
  const /** !RegExp */ complexlabel = /[^\w]/;
  const /** !RegExp */ scriptend = /<\/script>/g;

  var /** function(...) */ log = console.log;

  function /** !boolean */ isstring(/** * */ s)
  { return typeof s === "string"; }

  function /** string */ eumap(/** string */ s)
  { return {"+":"%2B"," ":"+","?":"%3F","&":"%26","#":"%23"}[s]; }

  function /** string */ htmlmap(/** string */ s)
  { return {"&":"&amp;","<":"&lt;"}[s]; }

  function /** string */ argmap(/** string */ s)
  { return {"&":"&amp;","\"":"&dquot;"}[s]; }

  function udate(t) { return t.valueOf() - t.getTimezoneOffset * 60000; }

  function /** !boolean */ iso(/** * */ obj)
  { var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  }

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
          if ((j1 = t.getDay()) !== 4)
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

  function /** string */ encpath(/** string */ s)
  { return s.toLowerCase()
        	.replace(/[^\0-~]/g, function(a) { return diacr[a] || a; })
        	.replace(/(?:&(?:[^&;\s]*;)?|[^&a-z0-9])+/g, "-")
        	.replace(/^-|[\u0300-\u036f]|-$/g, "");
  }

  function /** string */ sp(/** string */ j, /** string */ s)
  { if (j[0] === "0")
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
    return t.replace(/\s+/g, '&nbsp;');
  }

  function /** void */ logerr(/** * */ t,/** string */ x)
  { log("Remixml expression: " + JSON.stringify(t) + "\n" + x);
  }

  function /** void */ settag(/** function(!Object):!Array */ tpl,
   /** !Object */ $,/** string */ name,/** string= */ scope,
   /** string= */ args)
  { $["_"]["_tag"][name]
     = function /** void */(/** !Array */W,/** !Array */ H,/** !Object */ $)
      { $ = C(H, $, (args ? args.split(splc) : [])
         .reduce(function(a,i) { a[i] = 1; return a; }, {}), scope);
        return tpl($);
      };
  }

  function /** !Array|string */
   simplify(/** string */ expr,/** number= */ assign)
  { var /** Array */ r = expr.match(/^"([^(+]+)"$/);
    if (r)
    { expr = VP(r[1]);
      return assign ? [ expr ] : "[" + expr + "]";
    }
    return expr;
  }
  			// appendChild with text (coalesce strings first)
  T = function /** string */(/** !Array */ H,/** string= */ s)
  { if (!s)
      s = "\n";
    let /** number */ last = H.length - 1;
    if (isstring(H[last]))
    { if (s !== "\n" || H[last].slice(-1) !== s)
        H[last] += s;
    } else
      H.push(s);
  };
  			// appendChild (merge into)
  M = function /** void */(/** !Array */ H,/** !Array */ elm)
  { var /** !Array|string */ s;
    while (s = elm.shift())
    { if (s[""])
        H.push(s);
      else
        T(H, s);
    }
  };
  			// Evaluate recursively
  E = function /** !Array */
   (/** !Array */ elm,/** string */ recurse,/** !Object */ $)
  { var /** number */ n = +(recurse || 0);
    var /** string */ lastsrc = "";
    var /** string */ src;
    var /** function(Object) */ f;
    do
    { src = Y(elm);   // FIXME not generating back to txt?
      if (src === lastsrc)
        break;
      elm = js2obj(remixml2js(lastsrc = src))($);
    } while (--n);
    return elm;
  };
  			// Generic replace function
  P = function /** function(string):string */(/** string */ xp,
   /** string */ flags,/** string|function(...):string */ to)
  { return function (x) { return x.replace(RegExp(xp, flags), to); };
  };
  			// Replace runs of whitespace with a single space
  function /** string */ subws(/** string */ s)
  { return s.replace(/\s\s+/g, " ");
  }
  			// Replace runs of whitespace with a single space or nl
  function /** string */ subwnl(/** string */ s)
  { return s.replace(
     /(\n)\s+|[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+(?:(\n)\s*|([ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]))/g,
    "$1$2$3");
  }
  			// trim a single space from both ends
  U = function /** !Array */(/** !Array */ elm)
  { var /** string */ s;
    if (isstring(s = elm[0]) && s[0] === " " && !(elm[0] = s.substr(1)))
      elm.splice(0, 1);
    var /** number */ last = elm.length - 1;
    if (isstring(s = elm[last]) && s.slice(-1) === " "
     && !(elm[last] = s.slice(0, -1)))
      elm.splice(last, 1);
    return elm;
  };
  			// Get substring slice
  F = function /** !Array|string */(/** !Array|string */ x,
   /** number|string */ offset,/** number|string= */ limit)
  { offset = +(offset || 0); limit = +limit;
    return limit < 0 ? x.slice(offset, limit)
     : limit > 0 ? x.slice(offset, offset + limit)
     : limit == 0 ? x.slice(offset) : "";
  };
  			// Run filter fn() tree hierarchy
  R = function /** !Array */
   (/** !Array */ parent,/** function((!Array|string)):(!Array|string)= */ fn)
  { var /** !Array|string */ val;
    var /** number */ i = parent.length;
    var /** function((!Array|string)):(!Array|string) */ rfn = fn || subws;
    while (i--)
    { switch ((val = parent[i])[""])
      { case "!":
          if (!fn)
            break;
        default:
          R(val, fn);
          continue;
        case undefined:
          if (parent[i] = rfn(val))
            continue;
      }
      parent.splice(i, 1);
    }
    return parent;
  };
  			// Populate attributes on node
  S = function /** !Array */(/** !Object */ attr,/** string= */ tag)
  { var /** !Array */ r = L(tag);
    O.assign(r, attr);
    delete /** @type{Object} */(r)["::"];
    if (attr = attr["::"])
      O.assign(r, attr);
    return r;
  };
  			// New node
  L = function /** !Array */(
          /** function(!Array,!Array,!Object):void|string= */ nodename)
  { var /** !Array */ r = [];
    /** @type{Object} */(r)[""] = nodename || 1;
    return r;
  };
  			// Init new context
  N = function /** !Array */(/** !Object */ $)
  { var /** !Object */ _ = $["_"];
    if (!_)
      $["_"] = _ = {};
    if (!_["_tag"])
      _["_tag"] = {};
    if (!$["var"] && $["__"])
      $["var"] = $["__"];
    return L();
  };

  function /** void */
   defget(/** !Object */ o,/** string */ name,/** function():* */ fn)
  { O.defineProperty(o, name, { get: fn, configurable: true });
  }
  			// Create new subcontext
  C = function /** !Object */(/** !Array */ _,
   /** !Object */ $,/** !Object= */ args,/** string= */ scope)
  { if (/** @type{Object} */(_)[""] !== 1)
    { defget(_, "_contents", function()
        { let /** function(!Array,!Object):void|undefined */ cfn
           = /** @type{Object} */(_)["_c"];
          if (cfn)
            cfn(_.slice(), $);
	  else
            /** @type{Object} */(_)[""] = 1;
          return _;
        });
      if (args)
      { defget(_, "_restargs", function()
          { var /** string */ vname;
            var /** !Object */ rest = {};
            for (vname in this)
              switch (vname[0])
              { default:
          	if (!args[vname])
                    rest[vname] = this[vname];
                case "_":case undefined:;
              }
            return rest;
          });
      } else
	return /** @type{Object} */(_);
    }
    var /** !Object */ n$;
    (n$ = O.assign({}, $))["_"]
     = O.assign(_ , {"_":$["_"], "_tag":O.assign({}, $["_"]["_tag"])});
    if (scope)
      n$[scope] = _;
    return n$;
  };
  			// Process attrib value
  V = function /** void */(/** !Array */ H,/** string */ n,/** !Object */ _)
  { if (_[n] === undefined)
      _[n] = H.length === 1 && !H[0][""] ? H[0] : !H.length ? "" : H;
  };
  			// Execute remixml macro (if any)
                       // J: Element to append to
                      // H: Container content
                     // $: Variable context
  X = function /** void */(/** !Array */ J,/** !Array */ H,/** !Object */ $)
  { var /** function(!Array,!Array,!Object):void */ fn
     = $["_"]["_tag"][/** @type{Object} */(H)[""]];
    if (fn)
      fn(J, H, $);
    else
    { let /** function(!Array,!Object):void|undefined */ cfn
       = /** @type{Object} */(H)["_c"];
      if (cfn)
      { delete /** @type{Object} */(H)["_c"];
	cfn(H, $);
      }
      J.push(H);
    }
  };
  			// Define new remixml macro
  Q = function /** void */(/** string */ n,/** !Object */ $,
   /** function(string,!Array,!Array):void */ fn)
  { $["_"]["_tag"][n] = fn;
  };
			// Convert object list into iterator
  G = function /** !Object */(/** !Object */ $,/** string|!Array */ vname,
   /** function(...):!Array = */ ord)
  { var /** !Array */ r;
    var /** !Array|!Object */ k
     = /** @type{!Object} */(IA(vname) ? vname[0] : VE($, vname));
    if ((k = k || 0) && k.size >= 0)
      r = k.entries();
    else
    { r = O.entries(k);
      if (k.length >= 0)
        r.splice(k.length);
      if (ord)
      { try
        { r = r.sort(function(a, b)
          { var x, y, i, n, m;
            var /** number */ ret;
            x = ord(a); y = ord(b);
            for (i = 0, n = x.length; i < n; i++)
            { m = 0;
              if (IA(x[i]))
                m = 1, x[i] = x[i][0], y[i] = y[i][0];
              if (ret = /** @type {number} */
                       (x[i] > y[i] || -(x[i] !== y[i])))
                return m ? -ret : ret;
            }
            return m ? -ret : ret;
          });
        } catch(x) { logerr(ord, x); }
      }
    }
    return r[Symbol.iterator]();
  };
  			// Run CSS selector over abstract notation
  B = function /** void */(/** !Object */ $,
       /** !Array */ res,/** !Array */ H,/** string */ sel)
  { var /** number */ i = 0;
    while (i < H.length)
    { let /** !Array|string */ k = H[i++];
      switch (k[""])
      { default:
          B($, res, /** @type{!Array} */(k), sel);
          return;
        case sel:		  // FIXME support more than simple nodenames
	  res.push(C(k, $));
        case undefined:;
      }
    }
  };

  SP = function /** string */(/** string */ membr)
  { return membr.match(/^[A-Za-z_][\w]*$/) ? "." + membr : '["' + membr + '"]';
  }
                          // Evaluate variable entity
  VP = function /** string */(/** string */ vpath)
  { var /** !Array */ components = vpath.split(/[.[\]]+/);
    var /** string */ word;
    vpath = "$";
    for (word of components)
      vpath += SP(word);
    return vpath;
  }
                          // Evaluate variable entity
  Z = function /** * */(/** !Object */ $,/** string|!Array */ vname,
   /** string= */ quot,/** string= */ fmt)
  { var /** * */ x = IA(vname) ? vname[0] : VE($, vname);
    if (x == null)
      x = "";
    if (typeof x === "function")
      x = x($["_"], $);
    if (x[""])
    { switch (quot)
      { case "r":case "recurse":case "":case "none":
          if (!fmt)
            break;
        default:
          x = Y(/** @type{!Array} */(x));
      }
    } else if (- - /** @type {string|number} */(x) == x)
      /** @type {number} */(x) += "";
    if (fmt && !x[""])
    { let /** Array<string> */ r = fmt.match(
  /^([-+0]+)?([1-9][0-9]*)?(?:\.([0-9]+))?(t([^%]*%.+)|[a-zA-Z]|[A-Z]{3})?$/);
      let p = r[3], lang = $["sys"] && $["sys"]["lang"] || undefined;
      switch (r[4])
      { case "c": x = String.fromCharCode(+x); break;
        case "d": x = parseInt(x, 10).toLocaleString(); break;
        case "e":
          x = /** @type {function((null|string)):string} */
           ((+x).toExponential)(p > "" ? p : null);
          break;
        case "f":
          if (!(p > ""))
            p = 6;
          x = fmtf(+x, lang, /** @type {number} */(p));
          break;
        case "g": x = /** @type {function((number|string)):string} */
           ((+x).toPrecision)(p > "" ? p : 6); break;
        case "x": x = (parseInt(x, 10) >>> 0).toString(16); break;
        case "s":
          if (p > "")
            x = x.substr(0, p);
          break;
        default:
          x = r[4][0] === "t"
              ? strftime(r[5], /** @type {string} */(x), lang)
              : /[A-Z]{3}/.test(r[4]) ? fmtcur(+x, lang, r[4]) : x;
      }
      if (r[1])
      { if (r[1].indexOf("0") >= 0 && (p = +r[2]))
          x = +x < 0 ? sp(pad0(- /** @type {number} */(x), p), "-")
                     : pad0(/** @type {number} */(x), p);
        if (r[1].indexOf("+") >= 0 && +x >= 0)
          x = sp(/** @type {string} */(x), "+");
      }
    }
    switch (quot)
    { case "json": x = JSON.stringify(x).replace(/</g,"\\\\u003c");
        break;
      case "uric": x = x.replace(/[+ ?&#]/g, eumap);
        break;
      case "path": x = encpath(/** @type{string} */(x));
        break;
      default:
        if (!x[""])
	{ if (IA(x))
	    x = x.join(", ");
          x = x.replace(/[&<]/g, htmlmap);
	}
      case "":case "none":case "r":case "recurse":;
    }
    switch (x.length)
    { case 0:
        x = "";
       break;
      case 1:
        if (x[""] === 1)
          x = x[0];
    }
    if (quot === "r")
    { let /** string */ oldx = "";
      while (x !== oldx && x.indexOf("&") >= 0)
      { oldx = /** @type{string} */(x);
        x = VE($, ["(" + substentities(/** @type{string} */(x)) + ")"]);
      }
    }
    return x;
  };
                 // cloneabstract
  CA = function /** !Array */ (/** !Array */ k,/** !Array= */ r)
  { var /** * */ i;
    if (r)
    { for (i in r)
	delete r[/** @type{?} */(i)];
    } else
      r = [];
    r = /** @type{!Array} */(O.assign(r, k));
    i = r.length;
    while (i--)
    { if (r[i][""])
        r[i] = CA(r[i]);
    }
    return r;
  }
                // varinsert
  K = function /** number */
   (/** !Object */ $,/** !Array */ H,/** !Array|string|number */ x)
  { if (x[""])
    { if (x[""] === 1)
        M(H, CA(/** @type{!Array} */(x)));
      else
        H.push(x);
      x = 1;
    } else if (x || x !== undefined && (x += ""))
      T(H, /** @type{string} */(x)), x = 1;
    else
      x = 0;
    return x;
  };

  function /** string */ decodentity(/** string */ input)
  { return (new DOMParser().parseFromString(input, "text/html")).
     documentElement.textContent;
  }

  function /** string */ substentities(/** string */ sbj)
  { var /** string */ obj = "";
    let /** number */ i;
    if ((i = sbj.indexOf("&")) >= 0)
    { let /** RegExpResult */ a5;
      let /** string */ s = sbj.substr(0, i);
      let /** string */ sep = "";
      if (s)
        obj += JSON.stringify(s), sep = "+";
      txtentity.lastIndex = i;
      while (a5 = txtentity.exec(sbj))
      { switch ((s = a5[0])[0])
        { case "&":
            if (s.slice(-1) === ";")
	      if (s.indexOf(".") > 0)
              { obj += sep + "(function(){" + varent(a5)
                 + 'return x}catch(x){}return ""})()';
                break;
              } else
	        s = decodentity(s);
          default:
            s = JSON.stringify(s);
	    obj = obj.slice(-1) === '"'
	     ? obj.slice(0,-1) + s.slice(1) : obj + sep + s;
        }
        sep = "+";
      }
    } else
      obj += JSON.stringify(sbj);
    return obj;
  }

  function /** string */
   vareval(/** string */ vname,/** string|boolean */ quot,/** string */ fmt)
  { var /** string */ obj = "try{let x=Z($," + simplify(vname);
    if (quot)
      obj += "," + quot;
    if (fmt)
    { if (!quot)
        obj += ",0";
      obj += "," + fmt;
    }
    return obj + ");";
  }

  function /** string */ varent(/** !Array */ mtchs)
  { var /** string */ quot = mtchs[2];
    var /** string */ fmt = mtchs[3];
    return vareval(JSON.stringify(mtchs[1]),
     isstring(quot) && JSON.stringify(quot),
     fmt && JSON.stringify(fmt));
  }

  function /** string */ runexpr(/** string */ expr)
  { return "(_=$._," + (expr || 0) + ")";
  }

  function /** string */ evalexpr(/** string */ expr)
  { if (0 > expr.indexOf("("))
    { if ((expr = /** @type{string} */(JSON.parse(expr))).indexOf("_") >= 0)
        expr = "_=$._," + expr;
      return "(" + expr + ")";
    } else
    { expr = expr.slice(-1) === '"'
       ? (expr[0] === '"' ? expr.slice(1,-1) : '"+' + expr.slice(0,-1))
       : (expr[0] === '"' ? expr.slice(1): '"+' + expr) + '+"';
      if (expr.indexOf("{") >= 0)
	expr = "(" + expr + ")";
      expr = 'eval("' + expr + '")';
      return 0 > expr.indexOf("_") ? expr : "(_=$._," + expr + ")";
    }
  }

  const /** number */ TS_TAG = 0;
  const /** number */ TS_PARMS = 1;
  const /** number */ TS_FLAGS = 2;
  const /** number */ TS_PREFIX = 3;
  const /** number */ TRIMWHITE = 1;
  const /** number */ USERTAG = 2;
  const /** number */ STASHCONTENT = 4;
  const /** number */ HASBODY = 8;

  const /** number */ KILLWHITE = 1;
  const /** number */ PRESERVEWHITE = 2;

  function /** string */ remixml2js(/** string */ rxmls,/** number= */ flags)
  { // H: Current element to append in
    // W: Temporary parent element
    // I: Most recent truth value
    // J: Parent element to append the current element to when finished
    var /** string */ obj = '(function($){"use strict";var I,W,_,H=N($);';
    var /** number */ noparse = 0;
    var /** number */ comment = 0;
    var /** number */ nooutput = 0;
    var /** number */ simpleset;      // Peephole optimiser plain string sets
    var /** !Array */ tagctx = [0, {}, STASHCONTENT];
    var /** !Array */ tagstack = [tagctx];
    var /** number */ lasttoken = 0;
    function /** string */ getposition()
    { var /** string */ str = rxmls.slice(0, lasttoken);
      var /** number */ line = (str.match(/\n/g) || "").length + 1;
      var /** number */ offset = str.match(/[^\n]*$/)[0].length + 1;
      return line + ":" + offset;
    }
    function /** void */ logcontext(/** string */ tag,/** string */ msg)
    { if (RUNTIMEDEBUG)
	logerr(rxmls.substr(lasttoken - RUNTIMEDEBUG,
	       RUNTIMEDEBUG*2 + (tag ? tag.length : 0)),
	       msg + " at " + getposition());
    }
    function /** void */ startcfn()
    { if ((tagctx[TS_FLAGS] & (USERTAG|STASHCONTENT)) === USERTAG)
      { tagctx[TS_FLAGS] |= STASHCONTENT;
        obj += cfnprefix;
      }
    }
    function /** void */ markhasbody()
    { tagctx[TS_FLAGS] |= HASBODY;
    }
    function /** void */ bodyfromparent()
    { tagctx[TS_FLAGS] |= tagstack[tagstack.length - 2][TS_FLAGS] & HASBODY;
    }
    function /** void */ parenthasbody()
    { tagstack[tagstack.length - 1][TS_FLAGS] |= HASBODY;
    }
    function /** number */ getexclm(/** !RegExp */ regex)
    { var /** Array */ rm;
      regex.lastIndex = lasttoken;
      if (rm = execy(regex, rxmls))
      { lasttoken = regex.lastIndex;
        if (!comment)
        { obj += 'H.push(W=L("!"));W[0]='
           + JSON.stringify(rm[1]) + ";";
          markhasbody();
        }
	return 1;
      }
      return 0;
    }
    for (;;)
    { var /** Array */ rm;
      let /** string */ ts = "";
      if (lasttoken >= rxmls.length)
      { if (RUNTIMEDEBUG || ASSERT)
	{ let /** string */ shouldtag = tagctx[TS_TAG];
	  if (shouldtag)
	  { logcontext(shouldtag, "Missing close tag for " + shouldtag);
	    if (ASSERT)
	    { rxmls += "</" + shouldtag + ">";	// Fix it and continue
	      continue;
	    }
	  }
	}
	break;
      }
ntoken:
      switch (rxmls[lasttoken])
      { case "<":
	  if (rxmls[++lasttoken] === "!")
	  { if (rxmls.substr(++lasttoken, 2) === "--")
	    { if (getexclm(commentrx))
		break;
            } else if (getexclm(doctyperx))
              break;
          }
          params.lastIndex = lasttoken;
          let /** !Object */ gotparms = {};
          function /** string */ getparm(/** string */ name)
          { let /** string */ sbj = gotparms[name];
            return sbj && substentities(sbj);
          }
          function /** void */
	   domkmapping(/** string */ init,/** string */ vname)
	  { var /** string */ mapstring = getparm("mkmapping");
	    if (mapstring)
	    { let /** !Array */ maplist
	       = mapstring.slice(1,-1).split(/\s*,\s*/);
	      obj += init;
	      while (mapstring = maplist.pop())
                obj += vname + SP(mapstring) + '=k['
                    + maplist.length + "];";
	    }
	  }
          let /** string */ fw = params.exec(rxmls)[1];
	  if (fw === "/")
            gotparms[fw] = 1, fw = params.exec(rxmls)[1];
	  else if (!fw)
	  { lasttoken = params.lastIndex;
	    break ntoken;
	  }
          gotparms[""] = fw;
          while (rm = params.exec(rxmls))
	  { if (!rm[1])
	    { lasttoken = params.lastIndex;
	      break;
	    }
            gotparms[rm[1]] = rm[2] ? rm[2].slice(1,-1) : rm[1];
	  }
          let /** string|number */ close = gotparms["/"];
          delete gotparms["/"];
          let /** string */ tag = gotparms[""];
          if (close !== 1)
          { do
            { tagstack.push(tagctx = [tag, gotparms, 0, obj]);
	      obj = "";
	      if (gotparms["-"])
              { delete gotparms["-"];
	        tagctx[TS_FLAGS] = TRIMWHITE;
	      }
              switch (tag)
              { case "noparse": noparse++; continue;
                case "comment": comment++; break;
              }
              if (!comment)
              { delete gotparms[""];
                if (!nooutput)
                  obj += "W=H;";
                if (!noparse)
                { switch (tag)
                  { case "set":
                    { obj += letHprefix;
                      let vname = getparm("var") || getparm("variable");
		      simpleset = 0;
                      if (vname)
                      { let /** string|undefined */ xp = getparm("expr");
                        obj += vfnprefix;
			simpleset = obj.length;
                        if (ts = getparm("selector"))
		           obj += "B($,w=L(),H," + ts + ");H=w;";
                        else
                        { if (gotparms["json"] !== undefined)
                            obj += "H=JSON.parse(Y(H));";
                          if (ts = getparm("split"))
                          { obj += "H=Y(H).split("
                             + (xp ? evalexpr(xp) : ts) + ");";
                            xp = undefined;
                          }
                          if (xp !== undefined)
                            obj += "H="
        		     + (xp ? evalexpr(xp) : runexpr("Y(H)")) + ";";
                          if (ts = getparm("join"))
                            obj += "H=H.join(" + ts + ");";
                          domkmapping("let k=H[0];H={};", "H");
                        }
			if (obj.length !== simpleset)
			  simpleset = 0;
		        let /** !Array|string */ av = simplify(vname, 1);
		        if (IA(av))
		          obj += av[0] + "=A(" +
			    (gotparms["clone"] !== undefined
			     ? (simpleset = 0, "CA(H," + av[0] + ")") : "H")
		        else
		          simpleset = 0, obj += "A(H,$," + av;
		        obj +=")};w=(function(){";
                      } else if (ts = getparm("tag"))
		      { startcfn();
                        obj += "v=0;Q(" + ts
                         + ",$,function(H,a,$){let o=$;$=C(a,$,{";
                        { let /** string */ args = getparm("args");
                          if (args && (args = args.replace(/[^-:\w,]/g, "")))
                            obj += '"' + args.replace(splc, '":1,"') + '":1';
                        }
                        obj += "}";
                        if (ts = getparm("scope"))
                          obj += "," + ts;
                        obj += ");";
	                markhasbody();
                      }
                      continue;
                    }
                    case "insert":
                    { let vname = getparm("var") || getparm("variable");
                      if (vname)
                      { obj +=
			 vareval(vname, getparm("quote"), getparm("format"));
                        if (ts = getparm("join"))
                          obj += "x=x.join?x.join(" + ts + "):x;";
                        vname = getparm("limit");
                        if ((ts = getparm("offset")) || vname !== undefined)
                          obj += "x=F(x," + ts +
                           (vname !== undefined ? "," + vname : "") + ");";
                        obj += varinsert;
                      } else
                      { switch(getparm("variables"))
                        { case "dump":
                            obj += "log((W="
                             + getparm("scope") + ")?$[W]:$);";
                        }
		      }
                      continue;
                    }
                    case "replace":
                    { let /** string */ xp = getparm("regexp") ||
        	       getparm("from").replace(/([\\^$*+?.|()[{])/g, "\\$1");
                      let /** string */ flags = getparm("flags");
                      if (flags === undefined)
                        flags = "g";
                      obj += letHprefix + "J=W,v=P(" + xp + ","
                       + JSON.stringify(flags) + ",";
                      xp = getparm("expr");
                      obj += (xp ? evalexpr(xp) : getparm("to")) + ");";
		      bodyfromparent();
                      continue;
                    }
                    case "trim":
                      obj += letHprefix + "J=W;";
                      continue;
                    case "maketag":
                      obj += "{let H=L(" + getparm("name") + "),J=W;";
                      continue;
                    case "attrib":
                      obj += letHprefix + "v=" + getparm("name") + ",J=W;";
                      continue;
                    case "for":
                    { markhasbody();
		      obj += "{I=0;let g,i,k,m,J=W,n=0;";
                      let /** string */ from = getparm("in");
                      if (from)
                      { obj += "g=G($," + simplify(from) +
                         ((ts = getparm("orderby")) ?
                       ",(m=$._,function(_){let _index=_[0];$._=_=_[1];return["
			    + evalexpr(ts) + "]}));$._=m"
			  : ")")
                         + ";while(!(m=g.next()).done)"
			 + "{k=(m=m.value)[1];i=m[0];W=S({_value:k,";
                      } else
                      { obj += "for(i=+" + (getparm("from") || 0)
                         + ",m=" + ((from = getparm("step"))
			            ? "+(" + from + "||1)" : 1)
                         + ",k=+" + (getparm("to") || 0)
                         + ";m<0?i>=k:i<=k;i+=m){W=S({";
                      }
                      obj += "_recno:++n,_index:i});let o=$;$=C(W,$,{}";
                      if (ts = getparm("scope"))
                        obj += "," + ts;
                      obj += ");";
                      domkmapping("k=(m=$._)._value;", "m");
                      continue;
                    }
                    case "eval":
		      startcfn();
                      obj += letHprefix + "v="
		       + (getparm("recurse") || 0) + ",J=W;";
                      continue;
                    case "unset":
		    { let /** !Array|string */ av
                       = simplify(getparm("var") || getparm("variable"), 1);
		      startcfn();
		      if (IA(av))
		        obj += "delete " + av[0] + ";";
		      else
		        obj += 'eval("delete "+'
		             + VP(/** @type{string}*/(av)) + ");";
                      continue;
		    }
                    case "delimiter":
                      obj += "if(2>$._._recno){";
		      bodyfromparent();
                      continue;
                    case "elif":
                      ts = "(!I&&";
                    case "if":
                      obj += "if" + ts + "(I=" + evalexpr(getparm("expr"))
                       + ")" + (ts ? ")" : "") + "{";
		      bodyfromparent();
                      continue;
                    case "then":
                      obj += "if(I){";
		      bodyfromparent();
                      continue;
                    case "else":
                      obj += "if(!I){";
		      bodyfromparent();
                      continue;
                    case "nooutput":
                      nooutput++;
                      continue;
                  }
                }
                obj += "{let J=W,H=S({";
                { let /** string */ sep;
        	  if (sep = gotparms["::"])
        	    gotparms["::"] = sep.slice(0, -1) + ":;";
        	  sep = "";
                  for (fw in gotparms)
                  { if (ts = getparm(fw))
        	    { obj += sep
		       + (complexlabel.test(fw) ? '"' + fw + '"' : fw)
		       + ":" + getparm(fw);
                      sep = ",";
        	    }
        	  }
                }
                obj += '},"' + tag + '")';
              }
              if (tag === "script" && !close)
              { obj += ";";
		scriptend.lastIndex = lasttoken;
                scriptend.exec(rxmls);
                let /** number */ i = scriptend.lastIndex;
                if (!comment && !nooutput)      // substract closing script tag
		{ if (ts = rxmls.slice(lasttoken, i - 9))
                    obj += "H[0]=" + JSON.stringify(ts) + ";";
		}
                lasttoken = i;
                close = 1;
              } else if (!comment)
	      { obj += ";";
		tagctx[TS_FLAGS] |= USERTAG;
	      }
            } while(0);
          }
          if (close)
          {
closelp:    for (;;)
            { tagctx = tagstack.pop();
	      let /** string|undefined */ shouldtag = tagctx[TS_TAG];
              switch (shouldtag)
              { case "noparse": noparse--; break;
                case "comment": comment--; break;
                case "nooutput": nooutput--; break;
                default:
                  if (!comment)
                  { if (noparse)
                      obj += "}";
                    else
	            { switch (shouldtag)
                      { case "set":
			  if (obj.slice(-1) !== "{")  // Non-empty function?
                          { if (simpleset)  // Simplify plain assignment
			    { let /** Array<string> */ ar = obj.slice(simpleset)
			                          .match(/([^=]+=).+(".*")/);
                              obj = obj.slice(0, simpleset
				     - letHprefix.length - vfnprefix.length)
                               + ar[1] + ar[2] + ";";
			      break;
			    }
			  }
                          obj += "});v&&v()}";
                        case "insert":
			  parenthasbody();
                        case "unset":
                          break;
                        case "replace":
                          obj += "M(J,R(H,v))}";
			  parenthasbody();
                          break;
                        case "trim":
                          obj += "M(J,U(R(H)))}";
			  parenthasbody();
                          break;
                        case "maketag":
                          obj += "J.push(H)}";
			  parenthasbody();
                          break;
                        case "attrib":
                          obj += "V(H,v,J)}";
                          break;
                        case "for":
                          obj += "$=o;I=1}}";
			  parenthasbody();
                          break;
                        case "if":case "then":case "elif":case "else":
                          obj += "I=1}";
                          break;
                        case "eval":
                          obj += "M(J,E(H,v,$))}";
			  parenthasbody();
                          break;
                        default:
                          if (tagctx[TS_FLAGS] & STASHCONTENT)
			    obj += "};";
			case "script":
                          if (!nooutput)
                            obj += "X(J,H,$)";
                        case "delimiter":
                          obj += "}";
			  parenthasbody();
                      }
		      simpleset = 0;
                    }
                  }
		case undefined:;
              }
              if ((RUNTIMEDEBUG || ASSERT) && tag !== shouldtag)
	      { logcontext(tag, "Expected " + shouldtag + " got " + tag);
		if (ASSERT)
		{ let /** number */ i = tagstack.length;
		  while (i > 0)
		    if (tagstack[--i][TS_TAG] === tag)
		      continue closelp;
		}
	      }
	      obj = tagctx[TS_PREFIX] + obj;
	      tagctx = tagstack[tagstack.length - 1];
	      break;
            }
	  }
          break;
        case "&":
	  varentity.lastIndex = ++lasttoken;
	  if (rm = execy(varentity, rxmls))
          { lasttoken = varentity.lastIndex;
            if (!comment && !nooutput)
	      obj += varent(rm) + varinsert;
	    simpleset = 0;
	    markhasbody();
            break;
          }
	  ts = "&";	    // No variable, fall back to normal text
        default:
          textrx.lastIndex = lasttoken;
          ts += execy(textrx, rxmls)[0];
	  lasttoken = textrx.lastIndex;
          if (!comment && !nooutput)
	  { if (flags & (KILLWHITE|PRESERVEWHITE))
	    { if (flags & KILLWHITE)
	        ts = subws(ts);
	    } else
	      ts = subwnl(ts);		// Coalesce newlines by default
	    if (ts && !(tagctx[TS_FLAGS] & TRIMWHITE
                     && obj.slice(-2) !== "0}" // Not preceded by varentity?
	             && ts.match(/^\s+$/))) {
	      ts = JSON.stringify(ts);
	      if (!(tagctx[TS_FLAGS] & HASBODY))
		obj += "H[0]=" + ts, markhasbody();
	      else
	      { obj += "T(H";
		if (ts !== "\"\\n\"")
		  obj += "," + ts;
		obj += ")";
	      }
              obj += ";";
	    }
	  }
      }
    }
    return obj + "return H})";
  }

  function /** function(!Object):!Array */ js2obj(/** string */ jssrc)
  { var /** function(!Object):!Array */ constructor;
    try {
      constructor = /** @type{function(!Object):!Array} */(eval(jssrc));
    } catch(e) {
      if (RUNTIMEDEBUG)
      { logerr(jssrc, e);
	log(jssrc);
      }
      if (ASSERT)
        constructor = function() { return ""; };
    }
    if (D && DEBUG)
      log(constructor);
    return constructor;
  }

  // For use in Javascript Remixml
  sizeof = function /** number */(/** * */ s)
  { return Number(s) === s ? 1
     : s ? s.length || s[""] !== 1
      || O.keys(/** @type {!Object} */(s)).length : 0;
  };

  // For use in Javascript Remixml
  desc = function /** !Array|number */(/** number */ i)
  { return- -i===i?-i:[i,1];
  };

  // For use in Javascript Remixml
  abstract2txt = Y = function /** string */(/** !Array|string */ vdom)
  { for (;;)
    { if (!IA(vdom))
        return vdom;
      switch (vdom.length)
      { case 0:
          if (vdom[""] === 1)
            return "";
          break;
        case 1:
          if (vdom[""] === 1)
          { vdom = vdom[0];
            continue;
          }
      }
      break;
    }
    var /** string */ parent;
    var /** number */ i = 0;
    var /** string|number */ name = vdom[""];
    switch (name)
    { case "!":
        return "<!" + vdom[0] + ">";
      case 1:
        name = parent = "";
        break;
      default:
        parent = "<" + name;
	let /** string */ narg;
        for (narg of O.keys(vdom).splice(vdom.length))
          switch (narg[0])
          { default:
              let /** string */ val = /** @type{Object} */(vdom)[narg];
	      if (val != null && !iso(val))
              { parent += " " + narg;
		if (narg !== val)
	          parent += '="'
		   + (val.replace ? val.replace(/[&"]/g, argmap) : val) + '"';
	      }
            case "_":case undefined:;
          }
        if (!vdom.length)
          return parent + "/>";
        parent += ">";
    }
    var /** !Array|string */ child;
    while ((child = vdom[i++]) !== undefined)
      parent += child[""] ? Y(child) : child;
    if (name)
      parent += "</" + name + ">";
    return parent;
  };

  function /** !RegExp */ regexpy(/** string */ expr)
  { return RegExp(expr, ie11 ? "g" : "y");
  }

  function /** Array */ execy(/** !RegExp */ expr,/** string */ haystack)
  { if (ie11) {
      var /** number */ last = expr.lastIndex;
      var /** Array */ ret = expr.exec(haystack);
      return ret && /** @type{?} */(last == ret.index) && ret;
    }
    return expr.exec(haystack);
  }

  var g =
  { "remixml2js": function /** string */(/** string */ remixml)
      { return remixml2js(remixml);
      },
    "js2obj": function /** function(!Object):!Array */(/** string */ jssrc)
      { return js2obj(jssrc);
      },
    "compile": function /** function(!Object):!Array */(/** string */ remixml)
      { return js2obj(remixml2js(remixml));
      },
    "parse2txt": function
       /** string */(/** string|(function(!Object):!Array) */ tpl,
	            /** !Object */ $)
      { if (isstring(tpl))
          tpl = js2obj(remixml2js(/** @type{string} */(tpl)));
        return Y(/** @type{function(!Object):!Array} */(tpl)($));
      },
    "abstract2txt": function /** string */(/** !Array */ tpl)
      { return Y(tpl);
      },
    "set_tag": function /** void */(/** function(!Object):!Array */ cb,
       /** !Object */ $,/** string */ name,/** string= */ scope,
       /** string= */ args)
      { N($); settag(cb, $, name, scope, args);
      },
    "path_encode": encpath,
    "set_log_callback": function /** void */(/** function(...) */ cb)
      { log = cb;
      }
  };

    /////////////////////////////////////////////////////////////////////
   // Only useful inside a browser
  /////////////////////////////////////////////////////////////////////
  if (D)
  { function /** !Node */ newel(/** string */ n)
    { return D.createElement(n);
    }
    
    const /** Node */ txta = newel("textarea");
    
     // For use in Javascript Remixml
    // Converts the abstract presentation into a live DOM Node structure
    abstract2dom = D && function /** !Node */(/** !Array */ vdom)
    { var /** !Node */ parent;
      var /** number */ i = 0;
      var /** string|number */ name = /** @type{Object} */(vdom)[""];
      switch (name)
      { case "!":
          return D.createComment(vdom[0]);
        case 1:
          name = 0; parent = D.createDocumentFragment();
          break;
        default:
          if (!(parent = elmcache[name]))
            parent = elmcache[name] = newel(/** @type{string} */(name));
          parent = parent.cloneNode();
          for (name of O.keys(vdom).splice(vdom.length))
            switch (name[0])
            { default:
                let /** string */ val = /** @type{Object} */(vdom)[name];
                if (val != null && !iso(val))
                  parent.setAttribute(name, val);
              case "_":case undefined:;
            }
      }
      var /** !Array|string */ child;
      while ((child = vdom[i++]) !== undefined)
        parent.appendChild(child[""] ? abstract2dom(child)
         : child.indexOf("&") < 0 ? D.createTextNode(child)
         : (txta.innerHTML = child, txta.firstChild));
      txta.textContent = "";    // Free memory
      return parent;
    }
    
    if (!O.assign)
      O.defineProperty(O, "assign",
      { "value": function(d, s, i)
        { if (s) for (i in s) d[i] = s[i]; return d;
        }
      });
    if (!O.entries)
      O.entries = function(m)
      { var k = m ? O.keys(m) : [], i = k.length, r = new Array(i);
        while (i--)
          r[i] = [k[i], m[k[i]]];
        return r;
      };
    
    if ("ab".substr(-1) != "b")
      (function(p) {
        let s = p.substr;
        p.substr = function /** string */
                   (/** number */ a, /** number= */ n)
        { return s.call(this, a < 0 ? this.length + a : a, n); };
      })(String.prototype);

    g["abstract2dom"] = function /** Node */(/** !Array */ tpl)
      { return abstract2dom(tpl);
      };
    g["parse"] = function
       /** Node */(/** string|!Array|(function(!Object):!Array) */ tpl,
                  /** !Object */ $)
      { if (isstring(tpl))
          tpl = js2obj(remixml2js(/** @type{string} */(tpl)));
        return abstract2dom(IA(tpl)
	 ? tpl : /** @type{function(!Object):!Array} */(tpl)($));
      };
  }

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
  else if (typeof exports == "object")
    O.assign(/** @type{!Object} */(exports), g);
  else
    W["Remixml"] = g;

// Cut BEGIN delete
}).call(this);
// Cut BEGIN end
