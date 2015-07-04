module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var _ = require('lodash');

    return movedVendorStyles;

    // moves vendor scripts into the dev environment
    function movedVendorStyles(config){
        var sharedConfig = {overrides: config.overrides};
        var stylesConfig = _.extend({}, config.styles, sharedConfig);
        return pipes.bowerFiles('css', stylesConfig)
            .pipe(gulp.dest(stylesConfig.dest));
    }
};