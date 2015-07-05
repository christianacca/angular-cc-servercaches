module.exports = function(gulp, plugins, pipes, locals) {

    return builtStyles;

    // compiles and minifies css and moves to the prod environment
    function builtStyles(config) {
        config = config || locals.config;
        return gulp.src(config.styles.src.path, config.styles.src.options)
            .pipe(plugins.sourcemaps.init())
                .pipe(plugins.sass())
                .pipe(plugins.concat({path: config.styles.outputFile, cwd: ''}))
                .pipe(config.styles.isConcatFileOutput ? gulp.dest(config.styles.dest) : plugins.util.noop())
                .pipe(pipes.minifiedFileName())
                .pipe(plugins.minifyCss())
                .pipe(config.styles.isCacheBusted ? plugins.rev(): plugins.util.noop())
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest(config.styles.dest));
    }
};