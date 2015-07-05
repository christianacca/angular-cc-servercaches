module.exports = function(gulp, plugins, pipes, locals) {

    return validatedPartials;

    function validatedPartials(config) {
        config = config || locals.config;
        return gulp.src(config.partials.src.path, config.partials.src.options)
            .pipe(plugins.htmlhint({'doctype-first': false}))
            .pipe(plugins.htmlhint.reporter());
    }};