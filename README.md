<h1>Remixml</h1>

Remixml is an XML/HTML macro language/template engine.

The language and primitives used blend in completely with
standard XML/HTML syntax and therefore integrate smoothly with
existing XML/HTML syntax colouring editors.

## Requirements

It runs inside any webbrowser environment (starting at IE11 and up).

The engine uses browser primitives to accellerate parsing; most notably it
uses documentFragments and will therefore have trouble running in a plain
NodeJS environment.

## Basic usage

In essence Remixml is a macro language that has HTML/XML-like syntax
and uses special entities to fill in templates.  The entities that are
recognised by Remixml are always of the form: &amp;scope.varname;
I.e. they distinguish themselves from regular HTML entities by always
having at least one dot in the entity name.

The following sample code will illustrate the point:

```js
Remixml.parse('<h1>Title of &_.sitename; for &_.description;</h1>'
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
    - `path`<br />
      Path component; performs a lossy transformation of the
      value into a format that can be inserted into a path:
      - Cast to lowercase.
      - Replace diacritics by their ASCII equivalent.
      - Replace all strings of non-alphanumeric characters with single dashes.
      - Strip dashes from start and end.
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

Note: the entity reference must not contain spaces (the spaces shown
above are there to clarify the format, they should not be used in a real
entity reference).

### Language tags

- `<set var="" variable="" expr="" split="" join="" tag="" args="" noparse=""
    scope="">...</set>`<br />
   Attributes:
   - `var` or `variable`<br />
     Assign to the named variable.
   - `expr`<br />
     Use the javascript expression specified in this attribute.
     Or, alternately, if the attribute is empty, a javascript from
     the content of this tag is stored.
   - `regexp`<br />
     A regular expression to match the content to.
   - `split`<br />
     Split the content on this value; if used together with <i>regexp</i>,
     it will [split the content using a regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split).
   - `join`<br />
     Join an array using the specified separator.
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
   - `noparse`<br />
     Causes `&_._contents;` to be returned unparsed in this tag definition.
   - `scope`<br />
     Create a toplevel alias for the local scope in this tag definition.
- `<if expr="">...</if>`<br />
   Attributes:
   - `expr`<br />
     If the Javascript expression evaluates to true, include the
     content of the <b>if</b> tag.
- `<then>...</then>`<br />
     If the last truth value was true, include the content
     of the <b>then</b> tag.  Not needed for a typical if/else
     construction; usually used after a <b>for</b> tag
     to specify code that needs to included if the <b>for</b> tag
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
- `<for from="" to="" step="" in="" orderby="" scope="">...</for>`<br />
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
   - `scope`<br />
     Create a toplevel alias for the local scope in the current for loop.
- `<delimiter>...</delimiter>`<br />
   Should be used inside a <b>for</b> loop.  It will suppress its content
   upon the first iteration.
- `<insert var="" variable="" quote="" format="" offset="" limit=""
     variables="" scope=""></insert>`<br />
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
   - `variables`<br />
     Insert a variable group:
     - `dump`<br />
       Insert a JSON encoded dump of all accessible variables.
   - `scope`<br />
     Limit the scope of the dumped variables to the mentioned scope only.
- `<replace from="" regexp="" flags="" to="">...</replace>`<br />
   Attributes:
   - `from`<br />
     Search in the content of this tag for this text.
   - `regexp`<br />
     Search for this regular expression.
   - `flags`<br />
     [Regular expression flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
   - `to`<br />
     Replace found occurrences with this text.
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
- `<noparse>...</noparse>`<br />
   Copy the contents of this tag verbatim without further parsing
   (but strip the `noparse` tag itself).
- `<nooutput>...</nooutput>`<br />
   Suppress output inside this tag.
- `<comment>...</comment>`<br />
   Strip and skip this tag with content.

#### Javascript helperfunctions

These are extra helperfunctions which will be available
in the inline Remixml Javascript scripts.

- `sizeof(x)`<br />
  Returns the number of elements in an array or object, or the size of the
  string.  It is implemented as a definition in the global scope.

- `desc(x)`<br />
  This function is only available inside the `orderby` parameter of the
  `for` loop.  It causes the argument to be sorted in reverse.

### Examples

Simple assigment:

```html
<set var="_.variablename">the new value</set>
```

Simple calculations:

```html
<set var="_.variablename" expr="_.variablename + 1"></set>
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
  Can be a domNode, documentFragment, or text-html.
- `context`<br />
  Optional argument which specifies an object which can be referenced
  from within Remixml code.  The toplevel entries are the toplevel scopes
  in Remixml.  Within Remixml Javascript, this object will always be
  referenced using a single `$`.  The local scope will always exist
  as `$._` and that can always be referenced using a direct `_`
  shortcut.  I.e. in Javascript `$._.foo` and `_.foo` will both refer
  to the same variable.

Exposed API-list:
- `Remixml.preparse(template, context)`<br />
  Clones and parses the template.  It returns the parsed version, the
  original template is left in a preparsed/precompiled state to accellerate
  repeated parsing.
- `Remixml.parse(template, context)`<br />
  In-situ parses the template and returns it.  If you want to reuse the
  template, clone it first.
- `Remixml.parse2txt(template, context)`<br />
  Destructively parses the template, returns the result as a string
  (convenience function for dom2txt(parse())).
- `Remixml.parse_tagged(template, context)`<br />
  In-situ parses the template and returns it, but only touches regions
  enclosed in `<remixml>...</remixml>` tags.
- `Remixml.parse_document(context)`<br />
  In-situ parses the whole current page document (head *and* body) and returns
  it.
- `Remixml.dom2txt(template)`<br />
  Destructively converts the domNode(s) to a string and returns it.
- `Remixml.txt2dom(template)`<br />
  Turns the string template into a domNode structure.  If passed a domNode
  object, it returns it unchanged.
- `Remixml.path_encode(string)`<br />
  Strips and encodes `string` to something which can be safely inserted in
  an url (compare `path` encoding for entities).
- `Remixml.trim(template)`<br />
  In-situ trims whitespace like the Remixml `<trim>` tag and returns the
  trimmed template..

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

