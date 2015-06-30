module.exports = function(gulp, plugins/*, pipes, locals*/) {

    return builtStylesDev;

    function builtStylesDev(config) {
        return gulp.src(config.src.path, config.src.options)
            .pipe(plugins.sass())
            .pipe(gulp.dest(config.dest));
    }
};