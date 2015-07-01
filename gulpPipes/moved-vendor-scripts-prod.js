module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var _ = require('lodash');

    return movedVendorScriptsProd;

    // moves minified vendor scripts into the production environment
    function movedVendorScriptsProd(config){
        var sharedConfig = {overrides: config.overrides};
        var scriptsConfig = _.extend({}, config.scripts, sharedConfig);
        // todo: find a way to concatenate existing minified js that does not break sourcemap concept
        // ie combining all the minified files into one also includes sourceMapUrl for each js file - this
        // isn't supported by browsers
        return pipes.bowerFiles('min.js', scriptsConfig)
            //.pipe(plugins.order(scriptsConfig.order))
            //.pipe(plugins.concat('bower_components.min.js'))
            .pipe(plugins.rev())
            .pipe(gulp.dest(scriptsConfig.dest));
    }
};