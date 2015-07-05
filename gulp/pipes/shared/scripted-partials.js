module.exports = function(gulp, plugins, pipes, locals) {

    return scriptedPartials;

    function scriptedPartials(config) {
        config = config || locals.config;
        return pipes.validatedPartials(config)
            .pipe(plugins.htmlhint.failReporter())
            .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
            .pipe(plugins.ngHtml2js({
                moduleName: config.partials.moduleName
            }));
    }};