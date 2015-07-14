module.exports = function(gulp, plugins, pipes, locals) {

    var _ = require('lodash');

    return movedVendorScripts;

    // moves vendor scripts into the dev environment
    function movedVendorScripts(config){
        config = config || locals.config;
        var sharedConfig = {overrides: config.bowerComponents.overrides};
        var scriptsConfig = _.extend({},
            config.bowerComponents.scripts, sharedConfig,
            { newerThan: config.bowerComponents.scripts.dest });
        return pipes.bowerFiles('js', scriptsConfig)
            .pipe(gulp.dest(scriptsConfig.dest));
    }
};