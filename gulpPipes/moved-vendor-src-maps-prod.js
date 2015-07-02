module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var es = require('event-stream'),
        _ = require('lodash');

    return movedVendorSrcMapsProd;

    function movedVendorSrcMapsProd(config) {
        var sharedConfig = {
            overrides: config.overrides
        };
        var jsConfig = _.extend({}, config.scripts, sharedConfig);
        var jsFiles = pipes.movedVendorSrcMapsByExt('min.js', jsConfig);
        var cssConfig = _.extend({}, config.styles, sharedConfig);
        var cssFiles = pipes.movedVendorSrcMapsByExt('min.css', cssConfig);
        return es.merge(jsFiles, cssFiles);
    }
};