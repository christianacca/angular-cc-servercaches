module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return builtPartials;

    function builtPartials(config) {
        return pipes.validatedPartials(config)
            .pipe(gulp.dest(config.dest));
    }
};