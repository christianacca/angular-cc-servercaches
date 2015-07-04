module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var _ = require('lodash');

    return movedVendorScripts;

    // moves vendor scripts into the dev environment
    function movedVendorScripts(config){
        var sharedConfig = {overrides: config.overrides};
        var scriptsConfig = _.extend({}, config.scripts, sharedConfig);
        return pipes.bowerFiles('js', scriptsConfig)
            .pipe(gulp.dest(scriptsConfig.dest));
    }
};