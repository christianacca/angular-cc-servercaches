module.exports = function(gulp, plugins, pipes, locals) {

    return builtIndex;

    // validates and injects sources into index.html and moves it to the dev environment
    function builtIndex(config) {

        config = config || locals.config;

        var streams = {
            vendorScripts: pipes.movedVendorScripts(config.bowerComponents)
                .pipe(plugins.order(config.bowerComponents.scripts.order)),
            compScripts: pipes.movedCompScripts(config.component).pipe(plugins.angularFilesort()),
            appScripts: pipes.builtScripts(config.scripts).pipe(plugins.angularFilesort()),
            vendorStyles: pipes.movedVendorStyles(config.bowerComponents)
                .pipe(plugins.order(config.bowerComponents.styles.order)),
            compStyles: pipes.movedCompStyles(config.component),
            appStyles: pipes.builtStyles(config.styles)
        };

        return pipes.buildIndex(streams)
            .pipe(gulp.dest(config.distRoot));
    }
};