module.exports = function(gulp, plugins, pipes, locals) {

    var _ = require('lodash');

    return movedVendorStyles;

    // moves vendor scripts into the dev environment
    function movedVendorStyles(config){
        config = config || locals.config;
        var sharedConfig = {overrides: config.bowerComponents.overrides};
        var stylesConfig = _.extend({}, config.bowerComponents.styles, sharedConfig);
        return pipes.bowerFiles('css', stylesConfig)
            .pipe(gulp.dest(stylesConfig.dest));
    }
};