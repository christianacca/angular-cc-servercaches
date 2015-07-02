module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream'),
        _ = require('lodash');

    return movedVendorSrcMapsDev;

    function movedVendorSrcMapsDev(config) {

        config = config || locals.config.bowerComponents;

        var sharedConfig = {
            overrides: config.overrides
        };
        var jsConfig = _.extend({}, config.scripts, sharedConfig);
        var jsFiles = pipes.movedVendorSrcMapsByExt('js', jsConfig);
        var cssConfig = _.extend({}, config.styles, sharedConfig);
        var cssFiles = pipes.movedVendorSrcMapsByExt('css', cssConfig);
        return es.merge(jsFiles, cssFiles);
    }
};