module.exports = function(gulp, plugins, pipes, locals) {

    return processedImages;

    function processedImages(config) {
        config = config || locals.config;
        return gulp.src(config.images.src.path, config.images.src.options)
            .pipe(plugins.flatten())
            .pipe(gulp.dest(config.images.dest));
    }
};