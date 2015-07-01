module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var _ = require('lodash');

    return movedVendorScriptsDev;

    // moves vendor scripts into the dev environment
    function movedVendorScriptsDev(config){
        var sharedConfig = {overrides: config.overrides};
        var scriptsConfig = _.extend({}, config.scripts, sharedConfig);
        return pipes.bowerFiles('js', scriptsConfig)
            .pipe(gulp.dest(scriptsConfig.dest));
    }
};