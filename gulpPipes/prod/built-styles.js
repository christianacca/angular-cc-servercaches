module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return builtStyles;

    // compiles and minifies css and moves to the prod environment
    function builtStyles(config) {
        return gulp.src(config.src.path, config.src.options)
            .pipe(plugins.sourcemaps.init())
                .pipe(plugins.sass())
                .pipe(plugins.concat({path: config.outputFile, cwd: ''}))
                .pipe(config.isConcatFileOutput ? gulp.dest(config.dest) : plugins.util.noop())
                .pipe(pipes.minifiedFileName())
                .pipe(plugins.minifyCss())
                .pipe(config.isCacheBusted ? plugins.rev(): plugins.util.noop())
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest(config.dest));
    }
};