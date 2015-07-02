module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return builtIndexProd;

    // validates and injects sources into index.html, minifies and moves it to the prod environment
    function builtIndexProd(config) {

        var streams = {
            vendorScripts: pipes.movedVendorScriptsProd(config.bowerComponents),
            appScripts: pipes.builtScriptsProd(config.scripts, config.partials),
            compScripts: pipes.movedCompScriptsProd(config.component),
            appStyles: pipes.builtStylesProd(config.styles),
            compStyles: pipes.movedCompStylesProd(config.component),
            vendorStyles: pipes.movedVendorStylesProd(config.bowerComponents)
        };

        return pipes.buildIndex(streams)
            .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})
                .pipe(gulp.dest(config.distRoot)));
    }
};