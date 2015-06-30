module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var es = require('event-stream'),
        _ = require('lodash');

    return vendorSrcMapsProd;

    function vendorSrcMapsProd(config) {
        var sharedConfig = {
            overrides: config.overrides
        };
        var jsConfig = _.extend({}, config.scripts, sharedConfig);
        var jsFiles = pipes.vendorSrcMapsByExt('min.js', jsConfig);
        var cssConfig = _.extend({}, config.styles, sharedConfig);
        var cssFiles = pipes.vendorSrcMapsByExt('min.css', cssConfig);
        return es.merge(jsFiles, cssFiles);
    }
};