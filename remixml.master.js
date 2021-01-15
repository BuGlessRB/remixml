   /** @license
   ** Remixml v4.0.0: XML/HTML-like macro language compiler
  ** Copyright (c) 2018-2021 by Stephen R. van den Berg <srb@cuci.nl>
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
  var VP,CC,B,C,D,E,F,G,K,L,M,N,O,P,Q,R,S,T,U,V,X,Y,Z,
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

  const Doc = typeof document == "object" ? document : null;
  const W = Doc && window;
  const Obj = Object;
  const ie11 = /./.sticky != 0;
  const Mat = Math;

  const /** !Object */ eumapobj
   = {"+":"%2B"," ":"+","\t":"%09","\n":"%0A","\r":"%0D","?":"%3F","&":"%26",
      "#":"%23","<":"%3C"};
  const /** !Object */ htmlmapobj = {"&":"&amp;","<":"&lt;"};
  const /** !Object */ currencyobj
   = {"EUR":"\u20AC", "USD":"$", "CNY":"\u00A5"};

  const /** string */ varinsert = "I=K($,H,x)}catch(x){I=0}";
  const /** string */ cfnprefix = "H._c=function(H,$){";
  const /** string */ letHprefix = "{let H=L(),";
  const /** string */ vfnprefix = "w,v=function(){w();";
  const /** string */ missingg = "Missing <";
  const /** string */ wfunction = ")};w=(function(){";
  const /** string */ wfunclose = "});v()}";

  const /** !RegExp */ splc = /\s*,\s*/g;
  const /** !RegExp */ spsplsing = /\s*,\s*/;
  const /** string */ entend
   = "?:&(?:\\w*;|[\\w$:.[\\]]+(?=[^%;\\w$:.[\\]])|(?=[^\\w$:.[\\]]))";
  const /** !RegExp */ txtentity = RegExp("[^&]+(" + entend +
  "[^&]*)*|&([\\w$]+(?:[.[][\\w$]+]?)*\\.[\\w$]+)(?::([\\w$]*))?(?:%([^;]*))?;",
   "g");
  const /** !RegExp */ varentity = regexpy(
         "([\\w$]+\\.[\\w$]+(?:[.[][\\w$]+]?)*)(?::([\\w$]*))?(?:%([^;]*))?;");
  const /** !RegExp */ qemrx
   = regexpy("!(?:--([\0-\xff]*?)(?:--|$)|([^-][\0-\xff]*?))(?:>|$)"
          + "|\\?([\0-\xff]*?)(?:\\?>|$)");
  const /** !RegExp */ noparserx = regexpy("(?:noparse|comment)\\s");
  const /** !RegExp */ textrx = regexpy("[^&<]+(" + entend + "[^&<]*)*");
  const /** !RegExp */ params
   = /\s*(?:([-\w:]+|\/)\s*(?:=\s*("[^"]*"|'[^']*'))?|>)/g;
  const /** !RegExp */ complexlabel = /[^\w]/;
  const /** !RegExp */ scriptend = /<\/script>/g;
  const /** !RegExp */ styleend = /<\/style>/g;
  const /** !RegExp */ gmtrx = /.+GMT([+-]\d+).+/;
  const /** !RegExp */ tzrx = /.+\((.+?)\)$/;
  const /** !RegExp */ noparenplusrx = /^"([^(+]+)"$/;
  const /** !RegExp */ wordrx = /^[A-Za-z_][\w]*$/;
  const /** !RegExp */ varentrx =
   /^([-+0]+)?([1-9][0-9]*)?(?:\.([0-9]+))?(t([^%]*%.+)|[a-zA-Z]|[A-Z]{3})?$/;
  const /** !RegExp */ newlinerx = /\n/g;
  const /** !RegExp */ nonewlinerx = /[^\n]*$/;
  const /** !RegExp */ extractstrx = /([^=]+=).+(".*")/;
  const /** !RegExp */ spacelinerx = /^\s+$/;
  const /** !RegExp */ alphanumsrx = /%([A-Za-z%])/g;
  const /** !RegExp */ spacesrx = /\s+/g;
  const /** !RegExp */ spacesprx = /\s\s+/g;
  const /** !RegExp */ ltrx = /</g;
  const /** !RegExp */ uricrx = /[+ \t\n\r?&#<]/g;
  const /** !RegExp */ htmlmaprx = /[&<]/g;
  const /** !RegExp */ nonwordrx = /[^-:\w,]+/g;
  const /** !RegExp */ escaperxrx = /([\\^$*+?.|()[{])/g;
  const /** !RegExp */ ampquotrx = /"/g;
  const /** !RegExp */ dotbrackrx = /[.[\]]+/;
  const /** !RegExp */ wnlrx =
   /(\n)\s+|[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+(?:(\n)\s*|([ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]))/g;

  const /** !Object<function(string):string> */ filters = {};
  const /** !Object */ logcache = {};
  var /** function(...) */ debuglog = console.debug;
  var /** function(...) */ log = console.error;

  function /** !boolean */ isstring(/** * */ s)
  { return typeof s === "string"; }

  function /** string */ eumap(/** string */ s)
  { return eumapobj[s]; }

  function /** string */ htmlmap(/** string */ s)
  { return htmlmapobj[s]; }

  function udate(t) { return t.valueOf() - t.getTimezoneOffset * 60000; }

  function /** string */ pad0(/** number */ i, /** number */ p)
  { var /** string */ ret;
    for (i < 0 && p--, ret = i + ""; ret.length < p; ret = "0" + ret) {}
    return ret;
  }

  CC = function /** void */(/** !Object */ dst, /** !Object */ src)
  { try
    { Obj.assign(dst, src);
    } catch (x) {}
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
    return fmt.replace(alphanumsrx, function(a, p)
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
        case "j": return pad0(Mat.floor((udate(d) - udate(Date(y))) / h24) + 1,
                                3);
        case "C": return Mat.floor(y / 100);
        case "s": return Mat.round(d.valueOf() / 1000);
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
          return pad0(1 + Mat.ceil((ut - t) / (h24 * 7)), 2);
        case "u": return dy || 7;
        case "w": return dy;
        case "Y": return y;
        case "y": return (y + "").slice(2);
        case "F": return d.toISOString().slice(0, 10);
        case "c": return d.toUTCString();
        case "x": return d.toLocaleDateString();
        case "X": return d.toLocaleTimeString();
        case "z": return d.toTimeString().match(gmtrx)[1];
        case "Z": return d.toTimeString().match(tzrx)[1];
      }
      return a;
    });
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
      t = Mat.round(k * Mat.pow(10, d)) + "";
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
      t = (currencyobj[cur] || cur)
        + fmtf(k, lang, 2);
    return t.replace(spacesrx, '&nbsp;');
  }

  D = function /** void */(/** string */ x,/** *= */ t)
  { log("Remixml expression: " + (t ? JSON.stringify(t) : "") + "\n", x);
  };

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
  { var /** Array */ r = expr.match(noparenplusrx);
    if (r)
    { expr = VP(r[1]);
      return assign ? [ expr ] : "[" + expr + "]";
    }
    return expr;
  }
                           // appendChild with text (coalesce strings first)
  T = function /** string */(/** !Array */ H,/** string */ s)
  { let /** number */ last = H.length - 1;
    if (isstring(H[last]))
      H[last] += s;
    else
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

  function /** function(!Object):!Array */ compile(/** string */ remixml,
                                           /** number= */ flags)
  { return js2obj(remixml2js(remixml, flags));
  }
                           // Convert to text and back to abstract
  E = function /** !Array|!Promise */(
    /** string */ src,/** !Object */ $,/** number= */ flags)
  { return compile(src, flags)($);
  };
                          // Generic replace function
  P = function /** function(string):string */(/** string */ xp,
   /** string */ flags,/** string|function(...):string */ to)
  { return function (x) { return x.replace(RegExp(xp, flags), to); };
  };
                          // Replace runs of whitespace with a single space
  function /** string */ subws(/** string */ s)
  { return s.replace(spacesprx, " ");
  }
                       // Replace runs of whitespace with a single space or nl
  function /** string */ subwnl(/** string */ s)
  { return s.replace(wnlrx, "$1$2$3");
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
        case "<":
        case "?":
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
    Obj.assign(r, attr);
    delete /** @type{Object} */(r)["::"];
    if (attr = attr["::"])
      Obj.assign(r, attr);
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
  { Obj.defineProperty(o, name, { get: fn, configurable: true });
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
                  if (!(vname >= 0 || args[vname]))
                    rest[vname] = this[vname];
                case "_":case undefined:;
              }
            return rest;
          });
      } else
        return /** @type{Object} */(_);
    }
    var /** !Object */ n$;
    (n$ = Obj.assign({}, $))["_"]
     = Obj.assign(_ , {"_":$["_"], "_tag":Obj.assign({}, $["_"]["_tag"])});
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
  X = function /** Promise */(/** !Array */ J,/** !Array */ H,/** !Object */ $)
  { var /** function(!Array,!Array,!Object):Promise */ fn
     = $["_"]["_tag"][/** @type{Object} */(H)[""]];
    if (fn)
      return fn(J, H, $);
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
    { r = Obj.entries(k);
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
        } catch(x) { D(x, ord); }
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

  function /** string */ simplemember(/** string */ membr)
  { return membr.match(wordrx) ? "." + membr : '["' + membr + '"]';
  }
                               // Canonicalise variable path
  VP = function /** string */(/** string */ vpath)
  { var /** !Array */ components = vpath.split(dotbrackrx);
    var /** string */ word;
    vpath = "$";
    for (word of components)
      vpath += simplemember(word);
    return vpath;
  };
                      // Evaluate variable entity
  Z = function /** * */(/** !Object */ $,/** string|!Array */ vname,
   /** string= */ quot,/** string= */ fmt)
  { var /** * */ x = IA(vname) ? vname[0] : VE($, vname);
    var iscurrency;
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
    { let /** Array<string> */ r = fmt.match(varentrx);
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
              : /[A-Z]{3}/.test(r[4])
	        ? (iscurrency = fmtcur(+x, lang, r[4])) : x;
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
    { case "json": x = JSON.stringify(x).replace(ltrx, "\\\\u003c");
        break;
      case "uric": x = x.replace(uricrx, eumap);
        break;
      default:
        if (!x[""] && !iscurrency)  // Don't escape &nbsp;
        { if (IA(x))
            x = x.join(", ");
	  let /** function(string):string */ filterfn = filters[quot];
	  x = filterfn ? filterfn(/** @type{string} */(x))
	               : x.replace(htmlmaprx, htmlmap);
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
  O = function /** !Array */ (/** !Array */ k,/** !Array= */ r)
  { var /** * */ i;
    if (r)
    { for (i in r)
        delete r[/** @type{?} */(i)];
    } else
      r = [];
    r = /** @type{!Array} */(Obj.assign(r, k));
    i = r.length;
    while (i--)
    { if (r[i][""])
        r[i] = O(r[i]);
    }
    return r;
  };
                // varinsert
  K = function /** number */
   (/** !Object */ $,/** !Array */ H,/** !Array|string|number */ x)
  { if (x[""])
    { if (x[""] === 1)
        M(H, O(/** @type{!Array} */(x)));
      else
        H.push(x);
      x = 1;
    } else if (x || x !== undefined && (x += ""))
      T(H, /** @type{string} */(x)), x = 1;
    else
      x = 0;
    return x;
  };

  function /** string */ substentities(/** string */ sbj)
  { var /** string */ obj = "";
    var /** string */ sep = "";
    var /** RegExpResult */ a5;
    txtentity.lastIndex = 0;
    while (a5 = txtentity.exec(sbj))
    { if (a5[1])
      { obj += sep + "(function(){" + varent(a5)
         + 'return x}catch(x){}return ""})()';
      } else
        obj += sep + JSON.stringify(a5[0]);
      sep = "+";
    }
    return obj;
  }

  function /** string */ vareval(/** string */ vname,
              /** string|boolean|undefined */ quot,/** string|undefined */ fmt)
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

  function /** string */ protectjs(/** string */ expr)
  { return "(function(){try{return(" + expr +
     ')}catch(x){D(x)}return ""})()';
  }

  function /** string */ runexpr(/** string */ expr)
  { return "(_=$._," + (expr ? protectjs(expr) : '""') + ")";
  }

  function /** string|undefined */ evalexpr(/** string|undefined */ expr)
  { if (expr)
    { if (0 > expr.indexOf("("))
      { if ((expr = /** @type{string} */(JSON.parse(expr))).indexOf("_") >= 0)
          expr = "_=$._," + expr;
        expr = protectjs(expr);
      } else
      { expr = expr.slice(-1) === '"'
         ? (expr[0] === '"' ? expr.slice(1,-1) : '"+' + expr.slice(0,-1))
         : (expr[0] === '"' ? expr.slice(1): '"+' + expr) + '+"';
        if (expr.indexOf("{") >= 0)
          expr = "(" + expr + ")";
        expr = protectjs('eval("' + expr + '")');
        expr = 0 > expr.indexOf("_") ? expr : "(_=$._," + expr + ")";
      }
    }
    return expr;
  }

  function /** string */ execexpr(/** string|undefined */ xp)
  { return "H=" + (evalexpr(xp) || runexpr("eval(Y(H))")) + ";";
  }

  const /** number */ TS_TAG = 0;
  const /** number */ TS_PARMS = 1;
  const /** number */ TS_FLAGS = 2;
  const /** number */ TS_PREFIX = 3;
  const /** number */ TRIMWHITE = 1;
  const /** number */ USERTAG = 2;
  const /** number */ STASHCONTENT = 4;
  const /** number */ HASBODY = 8;
  const /** number */ VFUN = 16;

  const /** number */ KILLWHITE = 1;
  const /** number */ PRESERVEWHITE = 2;
  const /** number */ ASYNC = 4;

  function /** string */ remixml2js(/** string */ rxmls,/** number= */ flags)
  {    // H: Current element to append in
      // W: Temporary parent element
     // I: Most recent truth value
    // J: Parent element to append the current element to when finished
    const /** number */ isasync = flags & ASYNC;
    const /** string */ asyncf = isasync ? "async " : "";
    const /** string */ awaitf = isasync ? "await " : "";
    var /** string */ obj = "(" + asyncf
     + 'function($){"use strict";var I,W,_,H=N($);';
    var /** number */ noparse = 0;
    var /** number */ comment = 0;
    const /** string */ executecode = awaitf + "X(J,H,$)";
    const /** string */ evalcode        // FIXME not generating back to txt?
     = "do{if((k=Y(H))===m)break;H=" + awaitf + "E(m=k,$"
       + (flags ? "," + flags : "") + ")}while(--n);M(J,H)}";
    var /** number */ simpleset;      // Peephole optimiser plain string sets
    var /** !Array */ tagctx = [0, {}, STASHCONTENT, ""];
    var /** !Array */ tagstack = [tagctx];
    var /** number */ lasttoken = 0;
    function /** string */ getposition()
    { var /** string */ str = rxmls.slice(0, lasttoken);
      var /** number */ line = (str.match(newlinerx) || "").length + 1;
      var /** number */ offset = str.match(nonewlinerx)[0].length + 1;
      return line + ":" + offset;
    }
    function /** void */ logcontext(/** string */ tag,/** string */ msg)
    { if (RUNTIMEDEBUG)
        D(msg + " at " + getposition(),
	  rxmls.substr(lasttoken - RUNTIMEDEBUG,
               RUNTIMEDEBUG*2 + (tag ? tag.length : 0)));
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
    function /** void */ getexclm(/** !Array */ rm,/** number */ offset)
    { if (!comment)
      { obj += 'H.push(W=L("' + rm[0][0] + '"));W[0]='
         + JSON.stringify(rm[offset]) + ";";
        markhasbody();
      }
    }
    for (;;)
    { var /** Array */ rm;
      let /** string|undefined */ ts = "";
      if (lasttoken >= rxmls.length)
      { if (RUNTIMEDEBUG || ASSERT)
        { let /** string */ shouldtag = tagctx[TS_TAG];
          if (shouldtag)
          { logcontext(shouldtag, missingg + "/" + shouldtag + ">");
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
	  qemrx.lastIndex = ++lasttoken;
	  if (rm = execy(qemrx, rxmls))
          { lasttoken = qemrx.lastIndex;
	    if (!comment)
	    { if (rm[1])
	        getexclm(rm, 1);
	      else if (rm[2])
	      { rm[0] = "<";
	        getexclm(rm, 2);
	      } else
              { noparserx.lastIndex = 0;
	        if (execy(noparserx, ts = rm[3]))
	        { if (ts[0] === "n")	// noparse or comment?
	          { obj += "T(H,"
	             + JSON.stringify(ts.slice(noparserx.lastIndex)) + ");";
                    markhasbody();
	          }
	        } else
	          getexclm(rm, 3);
	      }
	    }
	    break;
          }
          params.lastIndex = lasttoken;
          let /** !Object */ gotparms = {};
          function /** string|undefined */ getparm(/** string */ name)
          { let /** string */ sbj = gotparms[name];
            return sbj && substentities(sbj);
          }
          function /** number|undefined */
           domkmapping(/** string */ init,/** string */ vname)
          { var /** string|undefined */ mapstring = getparm("mkmapping");
            if (mapstring)
            { let /** !Array */ maplist
               = mapstring.slice(1,-1).split(spsplsing);
              obj += init;
              while (mapstring = maplist.pop())
                obj += vname + simplemember(mapstring) + '=k['
                    + maplist.length + "];";
            } else if (mapstring === "")
	      return 1;
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
              { case "noparse":
		  if (!noparse++)
		  { markhasbody();
		    continue;
		  }
		  break;
                case "comment":
		  if (!noparse)
		    comment++;
		  break;
              }
              if (!comment)
              { delete gotparms[""];
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
			tagctx[TS_FLAGS] |= VFUN;
                        simpleset = obj.length;
                        if (ts = getparm("selector"))
                           obj += "B($,w=L(),H," + ts + ");H=w;";
                        else
                        { if (gotparms["json"] !== undefined)
                            obj += "H=JSON.parse(Y(H));";
                          if (ts = getparm("split"))
                          { obj += "H=Y(H).split("
                             + (evalexpr(xp) || ts) + ");";
                            xp = undefined;
                          }
                          if (xp !== undefined)
                            obj += execexpr(xp);
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
                             ? (simpleset = 0, "O(H," + av[0] + ")") : "H")
                        else
                          simpleset = 0, obj += "A(H,$," + av;
                        obj += wfunction;
                      } else if (ts = getparm("tag"))
                      { startcfn();
                        obj += "v=0;Q(" + ts + ",$," + asyncf
			 + "function(H,a,$){let o=$;$=C(a,$,{";
                        { let /** string|undefined */ args = getparm("args");
                          if (args && (args = args.replace(nonwordrx, "")))
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
                      } else if ((vname = getparm("expr")) !== undefined) {
                          obj += letHprefix + vfnprefix + execexpr(vname)
			   + "W.push(A(H)" + wfunction;
			  markhasbody();
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
                    { let /** string|undefined */ flags = getparm("flags");
                      if (flags === undefined)
                        flags = "g";
                      obj += letHprefix + "J=W,v=P(" + (getparm("regexp")
			   || getparm("from").replace(escaperxrx, "\\$1"))
		       + ","
                       + JSON.stringify(flags) + ","
                       + (evalexpr(getparm("expr")) || getparm("to"))
		       + ");";
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
                      let /** string|undefined */ from = getparm("in");
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
                      if (domkmapping("k=(m=$._)._value;", "m") === 1)
	                obj += "CC($._,$._._value);";
                      continue;
                    }
                    case "eval":
                      obj += letHprefix + "n="
                       + ((ts = getparm("recurse")) === undefined
			  ? 1 : ts > 0 ? +ts : 0)
		       + ",J=W,k,m=0;";
                      continue;
                    case "unset":
                      if (ts = getparm("tag"))
                      { startcfn();
                        obj += "delete $._._tag[" + ts + "];";
                      } else if (ts = getparm("var") || getparm("variable"))
                      { let /** !Array|string */ av
                         = simplify(ts, 1);
                        if (IA(av))
                          obj += "delete " + av[0] + ";";
                        else
                          obj += 'eval("delete "+'
                               + VP(/** @type{string}*/(av)) + ");";
                      }
                      continue;
                    case "delimiter":
                      obj += "if($._._recno>1){";
                      bodyfromparent();
                      continue;
                    case "elif":
                      ts = "(!I&&";
                    case "if":
                      obj += "if" + ts + "(I="
		       + (evalexpr(getparm("expr")) || 0)
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
                  }
                }
                obj += "{let J=W,H=S({";
                { let /** string */ sep;
                  if (sep = gotparms["::"])
                    gotparms["::"] = sep.slice(0, -1) + ":;";
                  sep = "";
                  for (fw in gotparms)
                  { if (ts = getparm(fw))
                    { obj += sep + (complexlabel.test(fw)
		                    ? '"' + fw + '"' : fw) + ":" + ts;
                      sep = ",";
                    }
                  }
                }
                obj += '},"' + tag + '")';
              }
              if (!close)
              { let /** !RegExp|number */ rxend
		 = tag === "script" ? scriptend :
		   tag === "style" ? styleend : 0;
		if (rxend)
                { rxend.lastIndex = lasttoken;
                  rxend.exec(rxmls);
                  let /** number */ i = rxend.lastIndex;
                  obj += ";";
                  if (!comment)				// substract closing tag
                  { if (ts = rxmls.slice(lasttoken, i - 3 - tag.length))
                      obj += "H[0]=" + JSON.stringify(ts) + ";";
                  }
                  lasttoken = i;
                  close = 1;
	          break;
		}
	      }
	      if (!comment)
              { obj += ";";
                tagctx[TS_FLAGS] |= USERTAG;
              }
            } while(0);
          }
          if (close)
          {
closelp:    for (;;)
            { tagctx = tagstack.pop();
              let /** string|number */ shouldtag = tagctx[TS_TAG];
skipdef:      do {
                switch (shouldtag)
                { case "noparse":
		    if(!--noparse)
		      break skipdef;
		    break;
                  case "comment":
	            if (!noparse)
	            { comment--;
		      break skipdef;
		    }
	            break;
                  case 0:
		    break skipdef;
	        }
                if (!comment)
                { if (noparse)
                    obj += "J.push(H)}";
                  else
                  {
nobody:             do
		    { switch (shouldtag)
                      { case "set":
                          if (obj.slice(-1) !== "{")  // Non-empty function?
                          { if (simpleset)  // Simplify plain assignment
                            { let /** Array<string> */ ar = obj.slice(simpleset)
                                                  .match(extractstrx);
                              obj = obj.slice(0, simpleset
                                     - letHprefix.length - vfnprefix.length)
                               + ar[1] + ar[2] + ";";
                              break nobody;
                            }
                          }
                          obj += tagctx[TS_FLAGS] & VFUN ? wfunclose : "})}";
                          break;
                        case "insert":
		          if (tagctx[TS_FLAGS] & HASBODY)
		            obj += wfunclose;
                          break;
                        case "replace":
                          obj += "M(J,R(H,v))}";
                          break;
                        case "trim":
                          obj += "M(J,U(R(H)))}";
                          break;
                        case "maketag":
                          obj += "J.push(H)}";
                          break;
                        case "attrib":
                          obj += "V(H,v,J)}";
                        case "unset":
                          break nobody;
                        case "for":
                          obj += "$=o;I=1}}";
                          break;
                        case "if":case "then":case "elif":case "else":
                          obj += "I=1}";
                          break nobody;
                        case "eval":
			  obj += evalcode;
                          break;
                        case "nooutput":
			  obj += "J=[];";
                        default:
                          if (tagctx[TS_FLAGS] & STASHCONTENT)
                            obj += "};";
                        case "script":
                        case "style":
                          obj += executecode;
                        case "delimiter":
                          obj += "}";
                      }
                      parenthasbody();
                    } while (0);
                    simpleset = 0;
                  }
                }
              } while (0);
              if ((RUNTIMEDEBUG || ASSERT) && tag !== shouldtag)
              { logcontext(tag,
		 (shouldtag ? "Expected </" + shouldtag + "> got </"
		            : missingg) + tag + ">");
                if (ASSERT)
                { let /** number */ i = tagstack.length;
		  if (!i)
                    tagstack.push(tagctx);
                  while (i)
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
	  if (!noparse)
	  { if (rm = execy(varentity, rxmls))
            { lasttoken = varentity.lastIndex;
              if (!comment)
	      { obj += varent(rm) + varinsert;
                simpleset = 0;
                markhasbody();
	      }
              break;
            }
          }
          ts = "&";	    // No variable, fall back to normal text
        default:
          textrx.lastIndex = lasttoken;
          if (!execy(textrx, rxmls))
	    console.error("**" + rxmls + "**");
          textrx.lastIndex = lasttoken;
          ts += execy(textrx, rxmls)[0];
          lasttoken = textrx.lastIndex;
          if (!comment)
          { if (!noparse)
	    { if (flags & (KILLWHITE|PRESERVEWHITE))
              { if (flags & KILLWHITE)
                  ts = subws(ts);
              } else
                ts = subwnl(ts);	// Coalesce newlines by default
	    }
            if (ts && !(tagctx[TS_FLAGS] & TRIMWHITE
                     && obj.slice(-2) !== "0}" // Not preceded by varentity?
                     && ts.match(spacelinerx)))
	    { ts = JSON.stringify(ts);
              obj += tagctx[TS_FLAGS] & HASBODY
               ? (simpleset = 0, "T(H," + ts + ");")
               : "H[0]=" + (markhasbody(), ts) + ";";
	    }
          }
      }
    }
    obj += "return H})";
    if (Doc && DEBUG && !logcache[obj])
      logcache[obj] = rxmls;
    return obj;
  }

  function /** function(!Object):!Array */ js2obj(/** string */ jssrc)
  { var /** function(!Object):!Array */ constructor;
    try {
      constructor = /** @type{function(!Object):!Array} */(eval(jssrc));
    } catch(e) {
      if (RUNTIMEDEBUG)
      { D(e, jssrc);
        debuglog(jssrc);
      }
      if (ASSERT)
        constructor = function() { return ""; };
    }
    var /** number|string */ s;
    if (Doc && DEBUG && (s = logcache[jssrc]) !== 1)
    { debuglog([s], constructor);
      logcache[jssrc] = 1;
    }
    return constructor;
  }

  // For use in Javascript Remixml
  sizeof = function /** number */(/** * */ s)
  { return Number(s) === s ? 1
     : s ? s.length || s[""] !== 1
      || Obj.keys(/** @type {!Object} */(s)).length : 0;
  };

  // For use in Javascript Remixml
  desc = function /** !Array|number */(/** number */ i)
  { return- -i===i?-i:[i,1];
  };

  // For use in Javascript Remixml
  abstract2dom
   = function /** !Node */(/** !Array */ abstract,/** !Node= */ node)
  { return g["abstract2dom"](abstract, node);
  }

  // For use in Javascript Remixml
  abstract2txt = Y = function /** string */(/** !Array|string */ vdom,
   /** number= */ html)
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
    var /** string|number */ name = vdom[""];
    switch (name)
    { case "!":
        return "<!--" + vdom[0] + "-->";
      case "<":
        return "<!" + vdom[0] + ">";
      case "?":
        return "<?" + vdom[0] + "?>";
      case 1:
        name = parent = "";
        break;
      default:
        parent = "<" + name;
        let /** string */ narg;
        for (narg of Obj.keys(vdom).splice(vdom.length))
          switch (narg[0])
          { default:
              let /** string */ val = /** @type{Object} */(vdom)[narg];
              if (val != null && typeof val !== "object")
              { parent += " " + narg;
                if (narg !== val)
                  parent += '="'
                   + (val.replace
		     ? val.replace(ampquotrx, "&dquot;") : val) + '"';
              }
            case "_":case undefined:;
          }
        if (!vdom.length)     // </br> is like <br> for a browser
          return parent + (html && name !== "br" ? "></" + name + ">" : "/>");
        parent += ">";
    }
    var /** !Array|string */ child;
    var /** number */ i = 0;
    while ((child = vdom[i++]) !== undefined)
      parent += child[""] ? Y(child, html) : child;
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

  if (!Obj.assign)
    Obj.defineProperty(Obj, "assign",
    { "value": function(d, s, i)
      { if (s) for (i in s) d[i] = s[i]; return d;
      }
    });
  if (!Obj.entries)
    Obj.entries = function(m)
    { var k = m ? Obj.keys(m) : [], i = k.length, r = new Array(i);
      while (i--)
        r[i] = [k[i], m[k[i]]];
      return r;
    };

  var g =
  { "remixml2js": remixml2js,
    "js2obj": js2obj,
    "compile":compile,
    "parse2txt": function
       /** string */(/** string|(function(!Object):!Array) */ tpl,
                    /** !Object */ $,/** number= */ flags)
      { if (isstring(tpl))
          tpl = js2obj(remixml2js(/** @type{string} */(tpl), flags));
        return Y(/** @type{function(!Object):!Array} */(tpl)($));
      },
    "abstract2txt": Y,
    "add_filter": function /** void */(/** string */ name,
       /** function(string):string */ filterfn)
      { filters[name] = filterfn;
      },
    "set_tag": function /** void */(/** function(!Object):!Array */ cb,
       /** !Object */ $,/** string */ name,/** string= */ scope,
       /** string= */ args)
      { N($); settag(cb, $, name, scope, args);
      },
    "set_log_callback": function /** void */(/** function(...) */ cb)
      { log = cb;
      }
  };

  if (typeof define == "function" && define["amd"])
    define("remixml", [], g);
  else if (typeof exports == "object")
    Obj.assign(/** @type{!Object} */(exports), g);
  else
    W["Remixml"] = g;

// Cut BEGIN delete
}).call(this);
// Cut BEGIN end
