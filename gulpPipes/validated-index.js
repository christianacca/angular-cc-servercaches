module.exports = function(gulp, plugins, pipes, locals) {

    return validatedIndex;

    // checks index.html for syntax errors
    function validatedIndex() {
        return gulp.src(locals.indexPage)
            .pipe(plugins.htmlhint())
            .pipe(plugins.htmlhint.reporter());
    }
};