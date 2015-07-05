module.exports = function(gulp, plugins, pipes, locals) {

    return builtIndex;

    // validates and injects sources into index.html and moves it to the dev environment
    function builtIndex(config) {
        config = config || locals.config;
        var streams = {
            vendorScripts: pipes.movedVendorScripts(config)
                .pipe(plugins.order(config.bowerComponents.scripts.order)),
            compScripts: pipes.movedCompScripts(config).pipe(plugins.angularFilesort()),
            appScripts: pipes.builtScripts(config).pipe(plugins.angularFilesort()),
            vendorStyles: pipes.movedVendorStyles(config)
                .pipe(plugins.order(config.bowerComponents.styles.order)),
            compStyles: pipes.movedCompStyles(config),
            appStyles: pipes.builtStyles(config)
        };

        return pipes.buildIndex(streams, config)
            .pipe(gulp.dest(config.distRoot));
    }
};