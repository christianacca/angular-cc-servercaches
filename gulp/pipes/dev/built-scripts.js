module.exports = function(gulp, plugins, pipes, locals) {

    return builtScripts;

    function builtScripts(config) {
        config = config || locals.config;
        return pipes.validatedScripts(config)
            .pipe(gulp.dest(config.scripts.dest));
    }
};