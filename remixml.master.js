   /** @license
   ** Remixml v5: XML/HTML-like macro language compiler
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
  var B,C,D,E,F,G,K,L,M,N,O,P,Q,R,S,T,U,V,X,Y,Z,
   log,sizeof,desc,abstract2txt,abstract2dom;
  // Cut END for prepend
  var A,VE;
  // Cut END for externs
  // Cut BEGIN for prepend
  function A(_,$,v)
  {if(_&&!_.length&&_[""]===1)_="";return v?eval(T(v)+"=_;"):_};
  function VE($,v){return eval(Array.isArray(v)?v[0]:T(v))};
  // Cut END for prepend

  const Doc = typeof document == "object" ? document : null;
  const W = Doc && window;
  const Obj = Object;

  const /** !Object */ eumapobj
   = {"+":"%2B"," ":"+","\t":"%09","\n":"%0A","\r":"%0D","?":"%3F","&":"%26",
      "#":"%23","<":"%3C"};
  const /** !Object */ htmlmapobj = {"&":"&amp;","<":"&lt;"};

  const /** string */ varinsert = "I=K($,H,x)}catch(x){I=0}";
  const /** string */ cfnprefix = "H._c=function(H,$){";
  const /** string */ letHprefix = "{let H=L(),";
  const /** string */ missingg = "Missing <";

  const /** !RegExp */ splc = /\s*,\s*/g;
  const /** !RegExp */ spsplsing = /\s*,\s*/;
  const /** string */ entw = "\\w$:.[\\]]";
  const /** string */ entend
   = "?:&(?:\\w*;|[" + entw + "+(?=[^%;" + entw + ")|(?=[^" + entw + "))";
  const /** !RegExp */ txtentity = regexpy("(?:[^&]+|(" + entend +
  "[^&]*))+|&([\\w$]+(?:[.[][\\w$]+]?)*\\.[\\w$]+)(?::([\\w$]*))?(?:%([^;]*))?;"
  );
  const /** !RegExp */ varentity
   = /([\w$]+\.[\w$]+(?:[.[][\w$]+]?)*)(?::([\w$]*))?(?:%([^;]*))?;/y;
  const /** !RegExp */ qemrx
   = /!(?:--(.*?)(?:--|$)|([^-].*?))(?:>|$)|\?(.*?)(?:\?>|$)/ys;
  const /** !RegExp */ noparserx = /(?:noparse|comment)\s/y;
  const /** !RegExp */ textrx = regexpy("[^&<]+(" + entend + "[^&<]*)*");
  const /** !RegExp */ params =
/\s*((?:[^-:_a-zA-Z<&>\s\/]\s*)*)(?:([-:_a-zA-Z][-:\w]*|\/)\s*(?:=\s*("[^"]*"|'[^']*'))?|[<&>])/y;
  const /** !RegExp */ simplelabel = /^[_a-zA-Z]\w*$/;
  const /** !RegExp */ scriptend = /<\/script>/g;
  const /** !RegExp */ styleend = /<\/style>/g;
  const /** !RegExp */ noparenplusrx = /^"([^(+]+)"$/;
  const /** !RegExp */ wordrx = /^[A-Za-z_][\w]*$/;
  const /** !RegExp */ newlinerx = /\n/g;
  const /** !RegExp */ nonewlinerx = /[^\n]*$/;
  const /** !RegExp */ extractstrx = /([^=]+=).+(".*")/;
  const /** !RegExp */ spacelinerx = /^\s+$/;
  const /** !RegExp */ spacesprx = /\s\s+/g;
  const /** !RegExp */ ltrx = /</g;
  const /** !RegExp */ uricrx = /[+ \t\n\r?&#<]/g;
  const /** !RegExp */ htmlmaprx = /[&<]/g;
  const /** !RegExp */ nonwordrx = /[^-:\w,]+/g;
  const /** !RegExp */ escaperxrx = /([\\^$*+?.|()[{])/g;
  const /** !RegExp */ ampquotrx = /"/g;
  const /** !RegExp */ dotbrackrx = /[.[\]]+/;

  const /** !Object<function(string):string> */ filters = {};
  const /** !Object */ logcache = {};
  var /** function(string,*,!Object):* */ procfmt;
  var /** function(...) */ debuglog = console.debug;
  var /** function(...) */ log = console.error;

  function /** !boolean */ isa(/** * */ s) { return Array.isArray(s); }

  function /** !boolean */ isstring(/** * */ s)
  { return typeof s === "string"; }

  function /** string */ eumap(/** string */ s)
  { return eumapobj[s]; }

  function /** string */ htmlmap(/** string */ s)
  { return htmlmapobj[s]; }

  function /** string */ arraytostring(/** !Array|string */ s)
  { return isa(s) ? s.join(", ") : /** @type {string} */(s);
  }

  M = function /** void */(/** !Object */ dst, /** !Object */ src)
  { try
    { Obj.assign(dst, src);
    } catch (x) {}
  }

  D = function /** void */(/** string */ x,/** *= */ t)
  { log("Remixml expression: " + (t ? JSON.stringify(t) : "") + "\n", x);
  };

  function /** !Object */ marko(/** !Object */ accu,/** string */ val)
  { accu[val] = 1;
    return accu;
  }

  function /** void */ settag(/** function(!Object):!Array */ tpl,
   /** !Object */ $,/** string */ name,/** string= */ scope,
   /** string= */ args)
  { $["_"]["_tag"][name]
     = function /** void */(/** !Array */W,/** !Array */ H,/** !Object */ $)
      { delete /** @type{Object} */(H)[""];
	$ = C(H, $, args ? args.split(splc).reduce(marko, {}) : {}, scope);
        return tpl($);
      };
  }

  function /** !Array|string */
   simplify(/** string */ expr,/** number= */ assign)
  { var /** Array */ r = expr.match(noparenplusrx);
    if (r)
    { expr = T(r[1]);
      return assign ? [ expr ] : "[" + expr + "]";
    }
    return expr;
  }

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
  P = function /** function(string|!Array):string */(/** string */ xp,
   /** string */ flags,/** string|function(...):string */ to)
  { return function (x)
     { return arraytostring(x).replace(RegExp(xp, flags), to); };
  };
                          // Replace runs of whitespace with a single space
  function /** string */ subws(/** string */ s)
  { return s.replace(spacesprx, " ");
  }
                          // Trim a single space from both ends
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
    delete /** @type {Object} */(r)["::"];
    if (attr = attr["::"])
      Obj.assign(r, attr);
    return r;
  };
                                  // New node
  L = function /** !Array */(
          /** function(!Array,!Array,!Object):void|string= */ nodename)
  { var /** !Array */ r = [];
    /** @type {Object} */(r)[""] = nodename || 1;
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
  { if (/** @type {Object} */(_)[""] !== 1)
    { defget(_, "_contents", function()
        { let /** function(!Array,!Object):void|undefined */ cfn
           = /** @type {Object} */(_)["_c"];
          if (cfn)
            cfn(_.slice(), $);
          else
            /** @type {Object} */(_)[""] = 1;
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
        return /** @type {Object} */(_);
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
     = $["_"]["_tag"][/** @type {Object} */(H)[""]];
    if (fn)
      return fn(J, H, $);
    else
    { let /** function(!Array,!Object):void|undefined */ cfn
       = /** @type {Object} */(H)["_c"];
      if (cfn)
      { delete /** @type {Object} */(H)["_c"];
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
   /** function(...):!Array= */ ord)
  { var /** !Array */ r;
    var /** !Array|!Object */ k
     = /** @type {!Object} */(isa(vname) ? vname[0] : VE($, vname));
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
              if (isa(x[i]))
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
          B($, res, /** @type {!Array} */(k), sel);
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
  T = function /** string */(/** string */ vpath)
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
  { var /** * */ x = isa(vname) ? vname[0] : VE($, vname);
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
          x = Y(/** @type {!Array} */(x));
      }
    } else if (- - /** @type {string|number} */(x) == x)
      /** @type {number} */(x) += "";
    if (fmt && !x[""] && procfmt)
      x = procfmt(fmt, x, $);
    switch (quot)
    { case "json": x = JSON.stringify(x).replace(ltrx, "\\\\u003c");
        break;
      case "uric": x = x.replace(uricrx, eumap);
        break;
      default:
        if (!x[""])
        { x = arraytostring(/** @type {string|!Array} */(x));
	  let /** function(string):string */ filterfn = filters[quot];
	  x = filterfn ? filterfn(/** @type {string} */(x))
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
        break;
    }
    if (quot === "r")
    { let /** string */ oldx = "";
      while (x !== oldx && x.indexOf("&") >= 0)
      { oldx = /** @type {string} */(x);
        x = VE($, ["(" + substentities(/** @type {string} */(x)) + ")"]);
      }
    }
    return x;
  };
                // cloneabstract
  O = function /** !Array */ (/** !Array */ k,/** !Array= */ r)
  { var /** * */ i;
    if (r)
    { for (i in r)
        delete r[/** @type {?} */(i)];
    } else
      r = [];
    r = /** @type {!Array} */(Obj.assign(r, k));
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
        H.push.apply(H, O(/** @type {!Array} */(x)));
      else
        H.push(x);
      x = 1;
    } else if (x || x !== undefined && (x += ""))
      H.push(x), x = 1;
    else
      x = 0;
    return x;
  };

  function /** string */ substentities(/** string */ sbj)
  { var /** string */ obj = "";
    var /** string */ sep = "";
    var /** Array */ a5;
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
      { if ((expr = /** @type {string} */(JSON.parse(expr))).indexOf("_") >= 0)
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
    const /** string */ vfnprefix
     = "w,v=" + asyncf + "function(){" + awaitf + "w();";
    const /** string */ wfunction = ")};w=(" + asyncf + "function(W){";
    const /** string */ wfunclose = "});" + awaitf + "v()}";
    const /** string */ executecode = awaitf + "X(J,H,$)";
    const /** string */ evalcode        // FIXME not generating back to txt?
     = "do{if((k=Y(H))===m)break;H=" + awaitf + "E(m=k,$"
       + (flags ? "," + flags : "") + ")}while(--n);J.push.apply(J,H)}";
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
    function /** void */ logcontext(/** string|number */ tag,/** string */ msg)
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
    function /** void */ getexclm(/** !Array */ rm,/** number */ offset)
    { if (!comment)
        obj += 'H.push(W=L("' + rm[0][0] + '"));W[0]='
         + JSON.stringify(rm[offset]) + ";";
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
	  if (rm = qemrx.exec(rxmls))
          { lasttoken = qemrx.lastIndex;
	    if (!comment)
	    { if (rm[1])
	        getexclm(/** @type{!Array} */(rm), 1);
	      else if (rm[2])
	      { rm[0] = "<";
	        getexclm(/** @type{!Array} */(rm), 2);
	      } else
              { noparserx.lastIndex = 0;
	        if (noparserx.exec(ts = rm[3]))
	        { if (ts[0] === "n")	// noparse or comment?
	            obj += "H.push("
	             + JSON.stringify(ts.slice(noparserx.lastIndex)) + ");";
	        } else
	          getexclm(/** @type{!Array} */(rm), 3);
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
          var /** string */ fw;
	  function /** string */parseparam()
	  { rm = params.exec(rxmls);
	    if (RUNTIMEDEBUG && rm[1])
              logcontext(0, 'Skipping malformed parameter "' + rm[1] + '"');
	    return fw = rm[2];
	  }
          if (parseparam() === "/")
            gotparms[fw] = 1, parseparam();
          else if (!fw)
          { if (rm)
	      lasttoken = params.lastIndex;
            break ntoken;
          }
          gotparms[""] = fw;
          for (;;)
          { if (!parseparam())
            { lasttoken = params.lastIndex;
              break;
            }
            gotparms[fw] = rm[3] ? rm[3].slice(1,-1) : fw;
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
		    continue;
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
                        if (isa(av))
                          obj += av[0] + "=A(" +
                            (gotparms["clone"] !== undefined
                             ? (simpleset = 0, "O(H," + av[0] + ")") : "H")
                        else
                          simpleset = 0, obj += "A(H,$," + av;
                        obj += wfunction;
                      } else if (ts = getparm("tag"))
                      { startcfn();
                        obj += "v=0;Q(" + ts + ",$," + asyncf
			 + "function(H,a,$,W){let o=$;$=C(a,$,{";
                        { let /** string|undefined */ args = getparm("args");
                          if (args && (args = args.replace(nonwordrx, "")))
                            obj += '"' + args.replace(splc, '":1,"') + '":1';
                        }
                        obj += "}";
                        if (ts = getparm("scope"))
                          obj += "," + ts;
                        obj += ");";
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
                      } else if ((vname = getparm("expr")) !== undefined)
                      { obj += letHprefix + vfnprefix + execexpr(vname)
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
                    { obj += "{I=0;let g,i,k,m,J=W,n=0;";
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
	                obj += "M($._,$._._value);";
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
                        let /** !Array|string */ av = simplify(ts, 1);
			function /** void */ tagpath(/** string */ts)
                        { ts = "._._tag" + ts;
                          obj += "$" + ts + "=$._._&&$._" + ts + ";";
			}
                        if (isa(av))
                          tagpath(av[0].slice(1));
			else
                        { obj += '{let v=' + /** @type {string}*/(av) + ';';
			  tagpath("[v]");
			  obj += "}";
			}
                      } else if (ts = getparm("var") || getparm("variable"))
                      { let /** !Array|string */ av = simplify(ts, 1);
                        obj += isa(av)
			 ? "delete " + av[0] + ";"
                         : 'eval("delete $."+'
                             + /** @type {string}*/(av) + ');';
                      }
                      continue;
                    case "delimiter":
                      obj += "if($._._recno>1){";
                      continue;
                    case "elif":
                      ts = "(!I&&";
                    case "if":
                      obj += "if" + ts + "(I="
		       + (evalexpr(getparm("expr")) || 0)
                       + ")" + (ts ? ")" : "") + "{";
                      continue;
                    case "then":
                      obj += "if(I){";
                      continue;
                    case "else":
                      obj += "if(!I){";
                      continue;
                  }
                }
                obj += "{let J=W,H=S({";
                { let /** string */ sep = gotparms["::"];
                  if (sep)
                    gotparms["::"] = sep.slice(0, -1) + ":;";
                  sep = "";
                  for (fw in gotparms)
                  { if (ts = getparm(fw))
                    { obj += sep + (simplelabel.test(fw)
		                    ? fw : '"' + fw + '"') + ":" + ts;
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
          { for (;;)
            { tagctx = tagstack.pop();
              let /** string|number */ shouldtag = tagctx[TS_TAG];
	      let /** number */ closelp = 0;
              if ((RUNTIMEDEBUG || ASSERT) && tag !== shouldtag)
              { logcontext(tag,
                 (shouldtag ? "Expected </" + shouldtag + "> got </"
                            : missingg) + tag + ">");
                if (ASSERT)
                { let /** number */ i = tagstack.length;
                  while (i)
                  { if (tagstack[--i][TS_TAG] === tag)
                    { closelp = 1;
                      break;
                    }
                  }
                  if (!closelp)
                  { tagstack.push(tagctx);
                    break;		      // Just ignore the closing tag
                  }
                }
              }
skipdef:      do
              {
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
                          obj += "J.push.apply(J,R(H,v))}";
                          break;
                        case "trim":
                          obj += "J.push.apply(J,U(R(H)))}";
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
                    } while (0);
                    simpleset = 0;
                  }
                }
              } while (0);
              obj = tagctx[TS_PREFIX] + obj;
              if (ASSERT && closelp)
                continue;
              tagctx = tagstack[tagstack.length - 1];
              break;
            }
          }
          break;
        case "&":
	  varentity.lastIndex = ++lasttoken;
	  if (!noparse)
	  { if (rm = varentity.exec(rxmls))
            { lasttoken = varentity.lastIndex;
              if (!comment)
	      { obj += varent(/** @type{!Array} */(rm)) + varinsert;
                simpleset = 0;
	      }
              break;
            }
          }
          ts = "&";	    // No variable, fall back to normal text
        default:
          textrx.lastIndex = lasttoken;
          rm = textrx.exec(rxmls);
          if (rm || !ASSERT)
          { ts += rm[0];
            lasttoken = textrx.lastIndex;
	  } else {
            if (RUNTIMEDEBUG)
	      log("Parse error **" + rxmls + "**");
	    ts += rxmls.substr(lasttoken);
            lasttoken = rxmls.length;
	  }
          if (!comment)
          { if (!noparse && flags & KILLWHITE)
              ts = subws(ts);
            if (ts && !(tagctx[TS_FLAGS] & TRIMWHITE
                     && obj.slice(-2) !== "0}" // Not preceded by varentity?
                     && ts.match(spacelinerx)))
              obj += "H.push(" + JSON.stringify(ts) + ");"
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
    try
    { constructor = /** @type {function(!Object):!Array} */(eval(jssrc));
    } catch(e)
    { if (RUNTIMEDEBUG)
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
    { switch (vdom[""])
      { case undefined:
	  return vdom;
	case 1:
	  switch (vdom.length)
	  { case 0:
	      return "";
	    case 1:
	      vdom = vdom[0];
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
              let /** string|!Array */ val = /** @type {Object} */(vdom)[narg];
              if (val != null)
              { if (val[""])
		  val = val.join("");
		parent += " " + narg;
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
  { return RegExp(expr, "y");
  }

  const /** !Object */ g =
  { "remixml2js": remixml2js,
    "js2obj": js2obj,
    "compile":compile,
    "parse2txt": function
       /** string */(/** string|(function(!Object):!Array) */ tpl,
                    /** !Object */ $,/** number= */ flags)
      { if (isstring(tpl))
          tpl = js2obj(remixml2js(/** @type {string} */(tpl), flags));
        return Y(/** @type {function(!Object):!Array} */(tpl)($));
      },
    "abstract2txt": Y,
    "add_filter": function /** void */(/** string */ name,
       /** function(string):string */ filterfn)
      { filters[name] = filterfn;
      },
    "set_proc_fmt":
      function /** void */(/** function(string,*,!Object):* */ fmtfn)
      { procfmt = fmtfn;
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
    Obj.assign(/** @type {!Object} */(exports), g);
  else
    W["Remixml"] = g;

// Cut BEGIN delete
}).call(this);
// Cut BEGIN end
