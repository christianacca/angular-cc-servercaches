module.exports = function(gulp, plugins, pipes, locals) {

    return builtIndex;

    // validates and injects sources into index.html, minifies and moves it to the prod environment
    function builtIndex(config) {
        config = config || locals.config;
        var streams = {
            vendorScripts: pipes.movedVendorScripts(config),
            appScripts: pipes.builtScripts(config),
            compScripts: pipes.movedCompScripts(config),
            appStyles: pipes.builtStyles(config),
            compStyles: pipes.movedCompStyles(config),
            vendorStyles: pipes.movedVendorStyles(config)
        };

        return pipes.buildIndex(streams, config)
            .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})
                .pipe(gulp.dest(config.distRoot)));
    }
};