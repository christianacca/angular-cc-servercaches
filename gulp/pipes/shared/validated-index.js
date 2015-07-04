module.exports = function(gulp, plugins, pipes, locals) {

    return validatedIndex;

    // checks index.html for syntax errors
    function validatedIndex(config) {
        config = config || locals.config;
        return gulp.src(config.indexPage)
            .pipe(plugins.htmlhint())
            .pipe(plugins.htmlhint.reporter());
    }
};