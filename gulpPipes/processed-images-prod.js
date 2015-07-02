module.exports = function(gulp, plugins/*, pipes, locals*/) {

    return processedImagesProd;

    function processedImagesProd(config) {
        return gulp.src(config.src.path, config.src.options)
            .pipe(plugins.flatten())
            .pipe(gulp.dest(config.dest));
    }
};