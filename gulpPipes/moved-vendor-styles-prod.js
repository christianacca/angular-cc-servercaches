module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var _ = require('lodash');

    return moveVendorStylesProd;

    // moves vendor styles into the production environment
    function moveVendorStylesProd(config){
        var sharedConfig = {overrides: config.overrides};
        var stylesConfig = _.extend({}, config.styles, sharedConfig);
        // todo: find a way to concatenate existing minified css that does not break sourcemap concept
        // ie combining all the minified files into one also includes sourceMapUrl for each css file - this
        // isn't supported by browsers
        return pipes.bowerFiles('min.css', stylesConfig)
            //.pipe(plugins.order(stylesConfig.order))
            //.pipe(plugins.concat('bower_components.min.css'))
            .pipe(plugins.rev())
            .pipe(gulp.dest(stylesConfig.dest));
    }
};