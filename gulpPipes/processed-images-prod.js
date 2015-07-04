module.exports = function(gulp, plugins, pipes, locals) {

    return processedImagesProd;

    function processedImagesProd(config) {
        config = config || locals.config.images;
        return gulp.src(config.src.path, config.src.options)
            .pipe(plugins.flatten())
            .pipe(gulp.dest(config.dest));
    }
};