module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return builtScripts;

    function builtScripts(config) {
        return pipes.validatedScripts(config)
            .pipe(gulp.dest(config.dest));
    }
};