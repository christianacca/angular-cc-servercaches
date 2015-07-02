module.exports = function(gulp, plugins, pipes, locals) {

    return builtIndexDev;

    // validates and injects sources into index.html and moves it to the dev environment
    function builtIndexDev(config) {

        config = config || locals.config;

        var streams = {
            vendorScripts: pipes.movedVendorScriptsDev(config.bowerComponents)
                .pipe(plugins.order(config.bowerComponents.scripts.order)),
            compScripts: pipes.movedCompScriptsDev(config.component).pipe(plugins.angularFilesort()),
            appScripts: pipes.builtScriptsDev(config.scripts).pipe(plugins.angularFilesort()),
            vendorStyles: pipes.movedVendorStylesDev(config.bowerComponents)
                .pipe(plugins.order(config.bowerComponents.styles.order)),
            compStyles: pipes.movedCompStylesDev(config.component),
            appStyles: pipes.builtStylesDev(config.styles)
        };

        return pipes.buildIndex(streams)
            .pipe(gulp.dest(config.distRoot));
    }
};