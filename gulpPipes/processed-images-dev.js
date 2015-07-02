module.exports = function(gulp, plugins, pipes, locals) {

    return processedImagesDev;

    function processedImagesDev(config) {
        config = config || locals.config.images;
        return gulp.src(config.src.path, config.src.options)
            .pipe(gulp.dest(config.dest));
    }
};