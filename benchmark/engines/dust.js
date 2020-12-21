var dust = require('dustjs-linkedin');

module.exports = {
    name: 'dust',
    ext: 'dust',
    render: function(template, data, callback) {
        template(data, callback);
    },
    load: function(src, templatePath, templateName, callback) {
        var templateFn = dust.compileFn(src, templateName);
        callback(null, templateFn);
    },
    compile: function(src, templatePath, templateName, callback) {
        var compiled = dust.compile(src, templateName);
        callback(null, compiled);
    }
};
