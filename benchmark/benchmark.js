Eta.configure({
  autoTrim: false
})

Sqrl.defaultConfig.autoTrim = false

var templateList = {}

templateList['template'] = `
<ul>
    <% for (var i = 0, l = list.length; i < l; i ++) { %>
        <li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
    <% } %>
</ul>`

templateList['template-raw'] = `
<ul>
    <% for (var i = 0, l = list.length; i < l; i ++) { %>
        <li>User: <%- list[i].user %> / Web Site: <%- list[i].site %></li>
    <% } %>
</ul>`

templateList['template-fast-mode'] = `
<ul>
    <% for (var i = 0, l = $data.list.length; i < l; i ++) { %>
        <li>User: <%= $data.list[i].user %> / Web Site: <%= $data.list[i].site %></li>
    <% } %>
</ul>`

templateList['template-fast-mode-raw'] = `
<ul>
    <% for (var i = 0, l = $data.list.length; i < l; i ++) { %>
        <li>User: <%- $data.list[i].user %> / Web Site: <%- $data.list[i].site %></li>
    <% } %>
</ul>`

templateList['eta'] = `
<ul>
    <% for (var i = 0, ln = it.list.length; i < ln; i ++) { %>
        <li>User: <%= it.list[i].user %> / Web Site: <%= it.list[i].site %></li>
    <% } %>
</ul>`

templateList['pug'] = `
ul
    -for (var i = 0, l = list.length; i < l; i ++) {
        li User: #{list[i].user} / Web Site: #{list[i].site}
    -}`

templateList['pug-raw'] = `
ul
    -for (var i = 0, l = list.length; i < l; i ++) {
        li User: !{list[i].user} / Web Site: !{list[i].site}
    -}`

templateList['dot'] = `
<ul>
    {{ for (var i = 0, l = it.list.length; i < l; i ++) { }}
        <li>User: {{!it.list[i].user}} / Web Site: {{!it.list[i].site}}</li>
    {{ } }}
</ul>`

templateList['dot-raw'] = `
<ul>
    {{ for (var i = 0, l = it.list.length; i < l; i ++) { }}
        <li>User: {{=it.list[i].user}} / Web Site: {{=it.list[i].site}}</li>
    {{ } }}
</ul>`

templateList['mustache'] = `
<ul>
    {{#list}}
        <li>User: {{user}} / Web Site: {{site}}</li>
    {{/list}}
</ul>`

templateList['mustache-raw'] = `
<ul>
    {{#list}}
        <li>User: {{{user}}} / Web Site: {{{site}}}</li>
    {{/list}}
</ul>`

templateList['handlebars'] = `
<ul>
    {{#list}}
        <li>User: {{user}} / Web Site: {{site}}</li>
    {{/list}}
</ul>`

templateList['handlebars-raw'] = `
<ul>
    {{#list}}
        <li>User: {{{user}}} / Web Site: {{{site}}}</li>
    {{/list}}
</ul>`

templateList['squirrelly'] = `
<ul>
{{@each(it.list) => val}}
    <li>User: {{val.user}} / Web Site: {{val.site}}</li>
{{/each}}
</ul>`

templateList['squirrelly-fast'] = `
<ul>
{{! for (var i = 0, l = it.list.length; i < l; i ++) { }}
    <li>User: {{it.list[i].user}} / Web Site: {{it.list[i].site}}</li>
{{! } }}
</ul>`

templateList['swig'] = `
<ul>
    {% for key, value in list %}
        <li>User: {{value.user}} / Web Site: {{value.site}}</li>
    {% endfor %}
</ul>`

templateList['swig-raw'] = `
<ul>
    {% for key, value in list %}
        {% autoescape false %}<li>User: {{value.user}} / Web Site: {{value.site}}</li>{% endautoescape %}
    {% endfor %}
</ul>`

/* ----------------- */

var oldrequire = window["require"];	// pug kludge

window["require"] = function (module) {
  switch (module) {
    case "art": return template;
    case "remixml": return Remixml;
    case "dot": return doT;
    case "handlebars": return Handlebars;
    case "eta": return Eta;
    case "squirrelly": return Sqrl;
    case "mustache": return Mustache;
    case "dustjs-linkedin": return dust;
    case "pug": return oldrequire("pug");
    case "lodash.template": return _.template;
    case "lodash": return _;
  }
  return window[module];
}
