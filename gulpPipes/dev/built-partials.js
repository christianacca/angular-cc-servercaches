module.exports = function(gulp, plugins, pipes, locals) {

    return builtPartials;

    // moves app html source files into the dev environment
    function builtPartials(config) {
        config = config || locals.config;
        return pipes.validatedPartials(config.partials)
            .pipe(gulp.dest(config.partials.dest));
    }
};