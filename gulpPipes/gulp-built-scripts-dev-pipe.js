module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return builtScriptsDev;

    function builtScriptsDev(config) {
        return pipes.validatedScripts(config)
            .pipe(gulp.dest(config.dest));
    }
};