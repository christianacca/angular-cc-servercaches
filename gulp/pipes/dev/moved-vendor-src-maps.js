module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream'),
        _ = require('lodash');

    return movedVendorSrcMaps;

    function movedVendorSrcMaps(config) {
        config = config || locals.config;
        var sharedConfig = {
            overrides: config.bowerComponents.overrides
        };
        var jsConfig = _.extend({}, config.bowerComponents.scripts, sharedConfig);
        var jsFiles = pipes.movedVendorSrcMapsByExt('js', jsConfig);
        var cssConfig = _.extend({}, config.bowerComponents.styles, sharedConfig);
        var cssFiles = pipes.movedVendorSrcMapsByExt('css', cssConfig);
        return es.merge(jsFiles, cssFiles);
    }
};