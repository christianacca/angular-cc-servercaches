module.exports = function(gulp, plugins, pipes, locals) {

    return builtStyles;

    function builtStyles(config) {
        config = config || locals.config;
        return gulp.src(config.styles.src.path, config.styles.src.options)
            .pipe(plugins.sass())
            .pipe(gulp.dest(config.styles.dest));
    }
};