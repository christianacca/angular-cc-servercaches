module.exports = function(gulp, plugins/*, pipes, locals*/) {

    return builtStyles;

    function builtStyles(config) {
        return gulp.src(config.src.path, config.src.options)
            .pipe(plugins.sass())
            .pipe(gulp.dest(config.dest));
    }
};