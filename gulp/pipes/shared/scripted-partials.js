module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return scriptedPartials;

    function scriptedPartials(config) {
        return pipes.validatedPartials(config)
            .pipe(plugins.htmlhint.failReporter())
            .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
            .pipe(plugins.ngHtml2js({
                moduleName: config.moduleName
            }));
    }};