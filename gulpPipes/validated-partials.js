module.exports = function(gulp, plugins/*, pipes, locals*/) {

    return validatedPartials;

    function validatedPartials(config) {
        return gulp.src(config.src.path, config.src.options)
            .pipe(plugins.htmlhint({'doctype-first': false}))
            .pipe(plugins.htmlhint.reporter());
    }};