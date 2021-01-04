<h1>Remixml</h1>

[![NPM version](http://img.shields.io/npm/v/remixml.svg?style=flat)](https://npmjs.org/package/remixml)
[![Downloads](https://img.shields.io/npm/dm/remixml.svg?style=flat)](https://npmjs.org/package/remixml)
[![Rate on Openbase](https://badges.openbase.io/js/rating/remixml.svg)](https://openbase.io/js/remixml?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)

Remixml is a sophisticated XML/XHTML macro language/templating compiler
engine in Javascript.

The Remixml templating engine has the following features:
- Rich powerful language with dynamic scopes, autoescaping, macros and more.
- Fast &amp; lean: Small 8 KB gzipped runtime with precompiled templates
  in the browser.  Compiles to Javascript.
- Extensible with custom tags programmed in either Javascript or Remixml.
- Extensible with custom filters programmed in Javascript.
- Everywhere available in node and all modern web browsers (including IE11),
  with thorough precompilation options.
- It contains a fully featured fast validating XHTML parser.

The language and primitives used blend in completely with
standard XML/XHTML syntax and therefore integrate smoothly with
existing XML/XHTML syntax colouring editors.

Compiling and processing XML, XHTML and Remixml automatically performs
sanity checks and shows clear and precise warnings about missing opening
or closing tags.

The package includes a comprehensive regression-testsuite to assure
code quality.  It also includes a browser template-library benchmark
framework to compare rendering speed between different template libraries.

## Requirements

It runs inside any webbrowser (starting at IE11 and up) or NodeJS environment.

Minified and gzip-compressed, it is less than 8 KB of code.

It has zero dependencies on other modules.

It supports (but does not require) output to the incremental-dom.

## Basic usage

In essence Remixml is a macro language that has XHTML/XML-like syntax
and uses special entities to fill in templates.  The entities that are
recognised by Remixml are always of the form: &amp;scope.varname;
I.e. they distinguish themselves from regular HTML entities by always
having at least one dot in the entity name.

The following sample code will illustrate the point:

```js
Remixml.parse2txt('<h1>Title of &_.sitename; for &_.description;</h1>'
  + '<p at="&anything.whatever;"> Some global variables &var.some; '
  + 'or &var.globalvars; or'
  + ' &var.arrays.1; or &var.arrays.2; or &var.objects.foo; or '
  + '&anything.really;',
 {_: {
    sitename: "foo.bar",
    description: "faster than lightning templates"
  },
  var: {
    some: "other",
    globalvars: 7,
    arrays: ["abc", 14, "def"],
    objects: {"foo":"bar", "indeed":"yes"}
  },
  anything: {
    really: "other",
    whatever: 7
  }
 });
```

## Reference documentation

### Full entity syntax

`& scope . variablename : encoding % formatting ;`

- `scope`<br />
  References the primary level in the variables object (the second
  argument to parse()).
- `variablename`<br />
  References second and deeper levels in the variables
  object (can contain multiple dots to designate deeper levels, is used
  to access both objects and arrays).
- `encoding` (optional)<br />
  Specifies the encoding to be used when substituting the variable.
  The encodings available are:
    - `html`<br />
      Default: encodes using
      [HTML entities](https://dev.w3.org/html5/html-author/charref).
    - `uric`<br />
      URI component: encodes URI arguments in an URL.
    - `json`<br />
      Encodes as a [JSON](https://www.json.org/) string.
    - `none`<br />
      No encoding, as is, can be abbreviated as ":;".
    - `recurse` or `r`<br />
      Like `none` but immediately searches for new entities to substitute
      inside the replaced content.
- `formatting` (optional)<br />
  [printf()-like formatting
   specification](https://en.wikipedia.org/wiki/Printf_format_string)
  .<br />
  Supported formats: %c, %d, %e, %f, %g, %s, %x.<br />
  If the formatting string equals a three-letter currency (all capitals),
  the value will be formatted like a currency (including currency symbol)
  in the current locale.<br />
  There is a special format `%t`: any string following it will be parsed
  as a [strftime()-like formatting
   specification](http://www.cplusplus.com/reference/ctime/strftime/)
  .<br />
  Most formats are supported.  Unsupported formats will stay in the
  string unchanged.

Note: all entity references evaluate safely.  If the entity contains
undefined parts, the resulting substitution string will always be empty.

Note: the entity reference must not contain spaces (the spaces shown
above are there to clarify the format, they should not be used in a real
entity reference).  The scope and variablename parts can be described
using the following regular expression: `[_$a-zA-Z0-9]+`.

### Language tags

All tags strip fully enclosed whitespace patches on the first level
if a single `-` parameter is given.

- `<set var="" variable="" expr="" regexp="" split="" join=""
    mkmapping="" selector="" json="" clone=""
    tag="" args="" scope="">...</set>`<br />
   Attributes:
   - `var` or `variable`<br />
     Assign to the named variable.
   - `expr`<br />
     Use the javascript expression specified in this attribute.
     Or, alternately, if the attribute is empty, javascript from
     the content of this tag is used.  Evaluates the javascript and
     stores the result.
   - `regexp`<br />
     A regular expression to match the content to.
   - `split`<br />
     Split the content on this value; if used together with <i>regexp</i>,
     it will [split the content using a regular
     expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split).
   - `join`<br />
     Join an array using the specified separator.
   - `mkmapping`<br />
     Assign this comma-separated list of names to the columns of the array.
   - `selector`<br />
     [Extract the selected content into an array of
     Nodes](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors).
   - `clone`<br />
     Clone the first level an array of object into the target while copying.
   - `json`<br />
     Parse the content as JSON.
   - `tag`<br />
     Declare a custom tag. `&_._contents;` can be used to reference
     the contents of the tag.  All argument values are accessible
     as variables from the local scope (`_`).  E.g. an attribute
     `foo="bar"` can be referenced as `&_.foo;` inside the tag definition.
   - `args`<br />
     Specifies which arguments this tag expects.  All other arguments are
     accessible through `&_._restargs;`.
     Using something like `<img ::="&_._restargs;" />` allows you to pass
     on all the remaining arguments.  The special argument `::` accepts
     an object and spreads out the elements as individual attributes.
   - `scope`<br />
     Create a toplevel alias for the local scope in this tag definition.
- `<unset var="" variable="" tag=""></unset>`<br />
   Attributes:
   - `var` or `variable`<br />
     Delete the named variable.
   - `tag`<br />
     Delete the named tag.
- `<if expr="">...</if>`<br />
   Attributes:
   - `expr`<br />
     If the Javascript expression evaluates to true, include the
     content of the <b>if</b> tag.
- `<then>...</then>`<br />
     If the last truth value was true, include the content
     of the <b>then</b> tag.  Not needed for a typical if/else
     construction; usually used after a <b>for</b> tag
     to specify code that needs to be included if the <b>for</b> tag
     actually completed at least one iteration.
- `<elif expr="">...</elif>`<br />
   Attributes:
   - `expr`<br />
     If the last truth value was false and the Javascript expression evaluates
     to true, include the content of the <b>elif</b> tag.
- `<else>...</else>`<br />
     If the last truth value was false, include the content of
     the <b>else</b> tag.  Can also be used after a <b>for</b> to specify
     code that needs to be included if the <b>for</b> tag did not iterate
     at all.
- `<for from="" to="" step="" in="" orderby="" scope="" mkmapping="">...</for>`
   <br />
   Upon iteration the following special variables are defined:
   - `&_._recno;`<br />
     Starts at 1 and counts up per iteration.
   - `&_._index;`<br />
     Contains the current loopindex for counted loops, or the index
     for iterations through arrays, or
     the key of the current element for iterations through objects.
   - `&_._value;`<br />
     Contains the current value for iterations through arrays or objects.

   Attributes:
   - `from`<br />
     Start counting <i>from</i> here (defaults to 0).
   - `to`<br />
     Count up till and including <i>to</i>.
   - `step`<br />
     Stepsize (defaults to 1).
   - `in`<br />
     Iterate through the named variable (the variable needs to contain
     either an array or an object).
   - `orderby`<br />
     A comma-separated list of Javascript variable expressions to sort an
     iteration
     through an object by.  When the function <b>desc()</b> is applied to
     the expression, the order of that expression will be reversed.
     Use the `_` scope to designate elements from the current element.
     There is shortcut reference `_index` which refers to the index
     of the current element.
   - `scope`<br />
     Create a toplevel alias for the local scope in the current for loop.
   - `mkmapping`<br />
     Assign this comma-separated list of names to the columns of an array
     in each record.
- `<delimiter>...</delimiter>`<br />
   Should be used inside a <b>for</b> loop.  It will suppress its content
   upon the first iteration.
- `<insert var="" variable="" quote="" format="" offset="" limit="" join=""
     variables="" scope="" expr=""></insert>`<br />
   More explicit way to access variable content instead of through
   entities.<br />
   Attributes:
   - `var` or `variable`<br />
     Variable name to be inserted.  Typically convenient to index objects
     using a different variable content as the index.
   - `quote`<br />
     Quote method (see entities), defaults to `none` (contrary to the
     entities, which default to `html`).
   - `format`<br />
     Format method (see entities).
   - `offset`<br />
     Substring index starting at this offset.
   - `limit`<br />
     Substring limit the total number of characters.
   - `join`<br />
     If it is an array, join it to a string using the provided separator.
   - `variables`<br />
     Insert a variable group:
     - `dump`<br />
       Insert a JSON encoded dump of all accessible variables.
   - `scope`<br />
     Limit the scope of the dumped variables to the mentioned scope only.
   - `expr`<br />
     Use the javascript expression specified in this attribute.
     Or, alternately, if the attribute is empty, javascript from
     the content of this tag is used.  Evaluates the javascript and inserts
     the result.
- `<replace from="" regexp="" flags="" to=""
     expr="">...</replace>`<br />
   Attributes:
   - `from`<br />
     Search in the content of this tag for this text.
   - `regexp`<br />
     Search for this regular expression.
   - `flags`<br />
     [Regular expression flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
   - `to`<br />
     Replace found occurrences with this text.
     [`$` characters here have special meaning](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter).
   - `expr`<br />
     Replace found occurrences with this javascript expression.
- `<trim>...</trim>`<br />
   Truncates whitespace at both ends, and reduce other whitespace runs of
   more than one character to a single space.
- `<maketag name="">...</maketag>`<br />
   Attributes:
   - `name`<br />
     Construct a new tag inline using this name.
   Subtags:
   - `<attrib name="">...</attrib>`<br />
     Attributes:
     - `name`<br />
     Add attributes to the tag with these names and values.
     The <b>attrib</b> subtags need to be at the beginning
     of the <b>maketag</b>.
- `<eval recurse="">...</eval>`<br />
   Reevaluate the content (e.g. useful to execute a tag
   created with <b>maketag</b>).<br />
   Attributes:
   - `recurse`<br />
     Specify the maximum recursion depth; defaults to `0`.
     Specifying no value sets the maximum depth to unlimited.
     Evaluation stops automatically as soon as no changes are detected
     anymore.
- `<script>...</script>`<br />
   Copy the contents of this tag verbatim without further parsing
   (and leave the `script` tag itself).  To force parsing inside
   `script` tags use `<maketag name="script">...</maketag>` instead.
- `<style>...</style>`<br />
   Treated exactly like `<script>` tags.
- `<noparse>...</noparse>`<br />
   Copy the contents of this tag verbatim without further parsing
   (but strip the `noparse` tag itself).
- `<?noparse ...?>`<br />
   Copy the contents of this tag verbatim without further parsing
   (but strip the `noparse` tag itself).
- `<nooutput>...</nooutput>`<br />
   Suppress output inside this tag.
- `<comment>...</comment>`<br />
   Strip and skip this tag with content.
- `<?comment ...?>`<br />
   Strip and skip this tag with content.
- `<cache>`<br />
   Reserved for future use.
- `<nocache>`<br />
   Reserved for future use.

#### Javascript helperfunctions

These are extra helperfunctions which will be available
in the inline Remixml Javascript scripts.

- `sizeof(x)`<br />
  Returns the number of elements in an array or object, or the size of the
  string.  It is implemented as a definition in the global scope.

- `desc(x)`<br />
  This function is only available inside the `orderby` parameter of the
  `for` loop.  It causes the argument to be sorted in reverse.

- `abstract2txt(abstract, html?)`

- `abstract2dom(abstract, node?)`

### Examples

Simple assigment:

```html
<set var="_.variablename">the new value</set>
```

Simple calculations:

```html
<set var="_.variablename" expr="_.variablename + 1" />
```

Conditionals:

```html
<if expr="_.variablename > 1">
 yes
</if>
<elif expr="_.variablename == 'foobar'">
 second condition valid
</elif>
<else>
 otherwise
</else>
```

Counted loop:

```html
<for from="1" to="42">
 This is line &_._recno;<br />
</for>
```

Iterating through an object or array:

```html
<set var="_.foo" split=",">aa,b,cc,d,eee,f</set>
<for in="_.foo">
 This is record &_._recno; value: &_._value;<br />
</for>
```

### API

Specified parameters:
- `template`<br />
  Can be text-html.
- `context`<br />
  Optional argument which specifies an object which can be referenced
  from within Remixml code.  The toplevel entries are the toplevel scopes
  in Remixml.  Within Remixml Javascript, this object will always be
  referenced using a single `$`.  The local scope will always exist
  as `$._` and that can always be referenced using a direct `_`
  shortcut.  I.e. in Javascript `$._.foo` and `_.foo` will both refer
  to the same variable.
- `flags` is an optional bitmask with:
   - 1: kill all whitespace.
   - 2: preserve all whitespace.  
   If neither bits are present, it defaults to collapsing whitespace
   around newlines to a single newline.

Exposed API-list (in NodeJS and the browser):
- `Remixml.remixml2js(remixmlsrc, flags?)`<br />
  Compile Remixml into remixml-javascript source.
- `Remixml.js2obj(jssrc)`<br />
  Compile remixml-javascript source into object code.
  Running the object code with a `context` parameter
  returns a DOM-abstract structure (AKA virtual DOM).
- `Remixml.abstract2txt(abstract, html?)`<br />
  Converts a DOM-abstract into an XHTML/Remixml-string.
  By default it produces valid XHTML, if it must be HTML compliant
  (e.g. for parsing by the browser built-in HTML parser)
  set the optional argument `html` to `1`.
- `Remixml.compile(remixmlsrc, flags?)`<br />
  Shorthand for `Remixml.js2obj(Remixml.remixml2js(remixmlsrc))`
- `Remixml.parse2txt(template, context, flags?)`<br />
  `template` can either be direct remixml source, or a precompiled object
  from `Remixml.compile`.  Returns an XHTML/Remixml-string.
- `Remixml.add_filter(name, filterfunction)`<br />
  Adds a new filter function to be used when inserting entities.
- `Remixml.set_tag(callback, context, name, scope?, args?)`<br />
  Creates a tag definition in the given `context` just like
  `<set tag="name"></set>` would have done.
  `callback` is a javascript function
  which will be called as `callback(context)` and must return
  the replacing DOM-abstract.  E.g. when the tag
  is referenced as `<name foo="bar"></name>` then inside the
  callback function `context._.foo` will have the value `bar`.
- `Remixml.set_log_callback(callback)`<br />
  If not set, it defaults to `console.log()`.  This callback function is used
  to log remixml runtime errors.

#### Reserved object variables

- `$.sys.lang`<br />
  If set, it overrides the default locale of the browser environment
  (currently only used during currency formatting).

## References

- The [Remixml website](http://remixml.org/) uses the smallest and
  fastest [lockandload AMD-loader](https://www.npmjs.com/package/lockandload).
- For historical reference:<br />
  Remixml was originally inspired by
[RXML, the Roxen webserver macro language](http://docs.roxen.com/).
- [remixml-dom](https://github.com/BuGlessRB/remixml-dom).
- [remixml-htmldom](https://github.com/BuGlessRB/remixml-htmldom).
- [remixml-idom](https://github.com/BuGlessRB/remixml-idom).
- [remixml-pathencode](https://github.com/BuGlessRB/remixml-pathencode).
- [remixml-jsobj](https://github.com/BuGlessRB/remixml-jsobj).

Card-carrying member of the `zerodeps` movement.
