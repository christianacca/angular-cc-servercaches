module.exports = function(gulp, plugins, pipes, locals) {

    return builtIndex;

    // validates and injects sources into index.html, minifies and moves it to the prod environment
    function builtIndex(config) {
        config = config || locals.config;
        var streams = {
            vendorScripts: pipes.movedVendorScripts(config.bowerComponents),
            appScripts: pipes.builtScripts(config.scripts, config.partials),
            compScripts: pipes.movedCompScripts(config.component),
            appStyles: pipes.builtStyles(config.styles),
            compStyles: pipes.movedCompStyles(config.component),
            vendorStyles: pipes.movedVendorStyles(config.bowerComponents)
        };

        return pipes.buildIndex(streams, config)
            .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})
                .pipe(gulp.dest(config.distRoot)));
    }
};